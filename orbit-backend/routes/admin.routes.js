
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { db } from '../data/db.js';
const router=Router();
const SECRET='orbit_assistant_dev_secret';

function adminAuth(req,res,next){
  const token=(req.headers.authorization||'').replace('Bearer ','');
  if(!token) return res.status(401).json({message:'Token requerido'});
  try{ req.admin=jwt.verify(token, SECRET); next(); }
  catch(e){ res.status(401).json({message:'Token inválido'}); }
}
router.post('/auth/login',(req,res)=>{
  const {email,password}=req.body;
  if(email==='admin@orbitassistant.cl' && password==='admin123'){
    const token=jwt.sign({email,role:'super_admin'}, SECRET, {expiresIn:'7d'});
    return res.json({token,admin:{email,role:'super_admin'}});
  }
  res.status(401).json({message:'Credenciales incorrectas'});
});
router.get('/auth/me', adminAuth, (req,res)=>res.json({admin:req.admin}));

router.get('/analytics/overview', adminAuth, (req,res)=>res.json({
  products: db.products.length,
  scans: db.scans.length || 128,
  questions: db.questions.length || 34,
  leads: db.leads.length,
  recommendation_clicks: 42
}));

router.get('/products', adminAuth, (req,res)=>res.json({products:db.products}));
router.get('/products/:id', adminAuth, (req,res)=>res.json({product:db.products.find(p=>p.id===Number(req.params.id))}));
router.post('/products', adminAuth, (req,res)=>{
  const p={id:db.products.length+1,is_active:true,ai_enabled:true,specs:[],...req.body};
  if(!p.slug) p.slug=(p.name||'producto').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  db.products.push(p); res.json({ok:true,product:p});
});
router.put('/products/:id', adminAuth, (req,res)=>{
  const idx=db.products.findIndex(p=>p.id===Number(req.params.id));
  if(idx<0) return res.status(404).json({message:'Producto no encontrado'});
  db.products[idx]={...db.products[idx],...req.body};
  res.json({ok:true,product:db.products[idx]});
});

router.get('/categories', adminAuth, (req,res)=>res.json({items:db.categories}));
router.get('/lines', adminAuth, (req,res)=>res.json({items:db.lines}));
router.get('/compatibilities', adminAuth, (req,res)=>res.json({items:[]}));
router.get('/guides', adminAuth, (req,res)=>res.json({items:[{title:'Guía Aspersor Pop-Up', description:'Instalación básica', is_active:true}]}));

router.get('/recommendations', adminAuth, (req,res)=>{
  const recommendations=db.recommendations.map(r=>({
    ...r,
    source_name:db.products.find(p=>p.id===r.source_product_id)?.name,
    recommended_name:db.products.find(p=>p.id===r.recommended_product_id)?.name
  }));
  res.json({recommendations});
});

router.get('/qr', adminAuth, (req,res)=>res.json({qrs:db.qrs.map(q=>({...q,product_name:db.products.find(p=>p.id===q.product_id)?.name}))}));
router.post('/qr/generate', adminAuth, (req,res)=>{
  const product=db.products.find(p=>p.id===Number(req.body.productId)) || db.products[0];
  const code=`${product.sku}-${Date.now().toString().slice(-5)}`;
  const qr={id:db.qrs.length+1,product_id:product.id,qr_code:code,qr_url:`qr.html?qr=${code}`,store_name:'Demo Retail',store_branch:'Demo',region:'Metropolitana',campaign_name:'Generado admin',is_active:true};
  db.qrs.push(qr); res.json({ok:true,qr});
});
router.get('/qr/:id/download', adminAuth, async (req,res)=>{
  const qr=db.qrs.find(q=>q.id===Number(req.params.id));
  if(!qr) return res.status(404).send('QR no encontrado');
  const publicUrl = `http://localhost:5500/qr.html?qr=${encodeURIComponent(qr.qr_code)}`;
  const format=req.query.format || 'png';
  if(format==='svg'){ const svg=await QRCode.toString(publicUrl,{type:'svg'}); res.setHeader('Content-Type','image/svg+xml'); res.setHeader('Content-Disposition',`attachment; filename="${qr.qr_code}.svg"`); return res.send(svg); }
  if(format==='pdf'){ res.setHeader('Content-Type','application/pdf'); res.setHeader('Content-Disposition',`attachment; filename="${qr.qr_code}.pdf"`); return res.send(Buffer.from('%PDF-1.4\\n% Orbit Assistant QR PDF demo\\n')); }
  const png=await QRCode.toBuffer(publicUrl); res.setHeader('Content-Type','image/png'); res.setHeader('Content-Disposition',`attachment; filename="${qr.qr_code}.png"`); res.send(png);
});

router.get('/leads', adminAuth, (req,res)=>res.json({leads:db.leads.map(l=>({...l,product_name:db.products.find(p=>p.id===l.product_id)?.name || 'Sin producto'}))}));
router.get('/leads/export/csv', adminAuth, (req,res)=>{
  const rows=[['email','nombre','producto','fuente','acepta_marketing','fecha']];
  db.leads.forEach(l=>rows.push([l.email,l.name||'',db.products.find(p=>p.id===l.product_id)?.name||'',l.source,l.accepts_marketing?'si':'no',l.created_at]));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\\n');
  res.setHeader('Content-Type','text/csv; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="orbit-leads.csv"'); res.send(csv);
});
router.get('/questions', adminAuth, (req,res)=>res.json({questions:db.questions}));
export default router;
