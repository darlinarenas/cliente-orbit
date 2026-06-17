
import { Router } from 'express';
import { db } from '../data/db.js';
const router=Router();

router.get('/product/:slug', (req,res)=>{
  const product=db.products.find(p=>p.slug===req.params.slug && p.is_active);
  if(!product) return res.status(404).json({message:'Producto no encontrado'});
  res.json({product});
});
router.get('/product/:slug/recommendations', (req,res)=>{
  const source=db.products.find(p=>p.slug===req.params.slug);
  if(!source) return res.json({recommendations:[]});
  const recommendations=db.recommendations.filter(r=>r.source_product_id===source.id).sort((a,b)=>a.priority-b.priority).map(r=>{
    const p=db.products.find(x=>x.id===r.recommended_product_id);
    return {...r, ...p, reason:r.reason, recommendation_type:r.recommendation_type};
  });
  res.json({recommendations});
});
router.get('/product/:slug/compatibles', (req,res)=>{
  const source=db.products.find(p=>p.slug===req.params.slug);
  const compatibles=db.recommendations.filter(r=>r.source_product_id===source?.id).map(r=>db.products.find(p=>p.id===r.recommended_product_id)).filter(Boolean);
  res.json({compatibles});
});
router.get('/product/:slug/installation', (req,res)=>res.json({ guide:{ title:'Guía visual de instalación', description:'Sigue estos pasos antes de instalar.', main_video_url:'', steps:[
  {step_number:1,title:'Mide la zona',description:'Define el área de riego.'},
  {step_number:2,title:'Revisa presión',description:'Verifica que esté entre el rango recomendado.'},
  {step_number:3,title:'Conecta accesorios',description:'Usa boquilla, conector y tubería compatible.'},
  {step_number:4,title:'Prueba cobertura',description:'Ajusta el patrón para evitar desperdicio.'}
]}}));
router.get('/product/:slug/media', (req,res)=>res.json({media:[]}));
router.get('/categories',(req,res)=>res.json({items:db.categories}));
router.post('/leads',(req,res)=>{
  const {email,name,productSlug,qrCode,source,acceptsMarketing}=req.body;
  if(!email || !acceptsMarketing) return res.status(400).json({message:'Email y aceptación de marketing son obligatorios'});
  const product=db.products.find(p=>p.slug===productSlug);
  const qr=db.qrs.find(q=>q.qr_code===qrCode);
  const lead={id:db.leads.length+1,email,name:name||'',product_id:product?.id,qr_id:qr?.id,source:source||'ficha_producto',accepts_marketing:!!acceptsMarketing,contacted:false,created_at:new Date().toISOString()};
  db.leads.push(lead);
  res.json({ok:true,message:'Correo registrado correctamente',lead});
});
export default router;
