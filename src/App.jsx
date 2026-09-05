import React, { useState, useEffect, useRef } from "react";
import {
  Home, CreditCard, Wallet, HeartPulse, Lightbulb, Users, ShoppingBasket,
  Music, Sparkles, Clock, FlaskConical, Plus, Trash2, Check, ChevronLeft,
  ChevronRight, TrendingUp, AlertCircle, PiggyBank, Coins, LayoutGrid,
  Pencil, Loader2, X, CalendarCheck, Receipt
} from "lucide-react";

/* ───────── helpers ───────── */
const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");
const fmtUsd = (n) => "USD " + (n || 0).toLocaleString("es-AR", { maximumFractionDigits: 2 });
const uid = () => Math.random().toString(36).slice(2, 9);
const hoy = () => {
  const d = new Date();
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
};

const MESES_NOMBRE = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril", "05": "Mayo",
  "06": "Junio", "07": "Julio", "08": "Agosto", "09": "Septiembre",
  "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};
const MES_LABEL = (k) => MESES_NOMBRE[k.split("-")[1]] + " " + k.split("-")[0];
const LISTA_MESES = [
  "2026-08", "2026-09", "2026-10", "2026-11", "2026-12",
  "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06",
];

const SECCIONES = {
  vivienda:  { nombre: "Vivienda",     texto: "text-pink-500",    fondo: "bg-pink-50",    borde: "border-pink-300",    punto: "bg-pink-400",    Icono: Home },
  visa:      { nombre: "Visa",         texto: "text-indigo-500",  fondo: "bg-indigo-50",  borde: "border-indigo-300",  punto: "bg-indigo-400",  Icono: CreditCard },
  master:    { nombre: "Mastercard",   texto: "text-orange-500",  fondo: "bg-orange-50",  borde: "border-orange-300",  punto: "bg-orange-400",  Icono: CreditCard },
  mp:        { nombre: "Mercado Pago", texto: "text-sky-500",     fondo: "bg-sky-50",     borde: "border-sky-300",     punto: "bg-sky-400",     Icono: Wallet },
  salud:     { nombre: "Salud",        texto: "text-violet-500",  fondo: "bg-violet-50",  borde: "border-violet-300",  punto: "bg-violet-400",  Icono: HeartPulse },
  servicios: { nombre: "Servicios",    texto: "text-emerald-500", fondo: "bg-emerald-50", borde: "border-emerald-300", punto: "bg-emerald-400", Icono: Lightbulb },
  circulo:   { nombre: "Círculo",      texto: "text-fuchsia-500", fondo: "bg-fuchsia-50", borde: "border-fuchsia-300", punto: "bg-fuchsia-400", Icono: Users },
  vida:      { nombre: "Vida diaria",  texto: "text-amber-500",   fondo: "bg-amber-50",   borde: "border-amber-300",   punto: "bg-amber-400",   Icono: ShoppingBasket },
  subs:      { nombre: "Suscripciones",texto: "text-cyan-500",    fondo: "bg-cyan-50",    borde: "border-cyan-300",    punto: "bg-cyan-400",    Icono: Music },
  otros:     { nombre: "Otros",        texto: "text-gray-400",    fondo: "bg-gray-50",    borde: "border-gray-300",    punto: "bg-gray-400",    Icono: Sparkles },
};
const CLAVES_SEC = Object.keys(SECCIONES);

const CUOTAS_INFO = [
  { nombre: "iPhone 15",       monto: 133333, fin: "2027-06", tarjeta: "visa" },
  { nombre: "Auriculares",     monto: 30583,  fin: "2026-11", tarjeta: "master" },
  { nombre: "47 Street",       monto: 27444,  fin: "2026-12", tarjeta: "master" },
  { nombre: "Cartera",         monto: 9839,   fin: "2027-01", tarjeta: "master" },
  { nombre: "Tablet (⅓ tuyo)", monto: 92785,  fin: "2026-10", tarjeta: "mp" },
  { nombre: "Protectores",     monto: 18000,  fin: "2026-11", tarjeta: "mp" },
];
const viva = (mes, fin) => mes <= fin;

/* ───────── datos por defecto ───────── */
function pagosDefault(mes) {
  const q1 = [], q2 = [];
  const p = (a, nombre, monto, seccion, dia, pagado = false) =>
    a.push({ id: uid(), nombre, monto, seccion, dia, pagado, nota: "", fechaPago: "" });

  if (mes === "2026-08") {
    p(q1, "Alquiler + ABL agosto", 565000, "vivienda", 10, true);
    p(q1, "Visa (resumen agosto)", 223981, "visa", 6, true);
    p(q1, "Mastercard (resumen agosto)", 67699, "master", 6, true);
    p(q1, "Comida 1ª quincena", 120000, "vida", 7, true);
    p(q2, "Expensas JULIO (atrasadas)", 85000, "vivienda", 22);
    p(q2, "Expensas agosto", 95000, "vivienda", 22);
    p(q2, "Círculo (5/8)", 100000, "circulo", 22);
    p(q2, "Psicóloga (2ª mitad)", 74000, "salud", 22);
    p(q2, "Gas", 4000, "servicios", 16, true);
    p(q2, "Internet", 47000, "servicios", 20, true);
    p(q2, "Comida 2ª quincena", 120000, "vida", 22);
    p(q2, "RESERVA alquiler septiembre", 275000, "vivienda", 22);
    p(q2, "Sertralina", 50000, "salud", 22);
    p(q2, "Pago a Mercado Pago", 135000, "mp", 23);
    return { q1, q2 };
  }

  const visaBase = mes === "2026-09" ? 350000
    : (viva(mes, "2027-06") ? 133333 : 0) + 5800 + 9200 + 42000;
  const masterBase = mes === "2026-09" ? 130000
    : (viva(mes, "2026-11") ? 30583 : 0) + (viva(mes, "2026-12") ? 27444 : 0) +
      (viva(mes, "2027-01") ? 9839 : 0) + 31000 + 11000;

  p(q1, "Alquiler", 550000, "vivienda", 10);
  p(q1, "ABL", 15000, "vivienda", 10);
  p(q1, "Visa (resumen)", visaBase, "visa", 7);
  p(q1, "Mastercard (resumen)", masterBase, "master", 7);
  if (viva(mes, "2026-10")) p(q1, "Tablet MP (cuota)", 92785, "mp", 7);
  if (viva(mes, "2026-11")) p(q1, "Protectores MP (cuota)", 18000, "mp", 7);
  p(q1, "Psicóloga (1ª mitad)", 74000, "salud", 7);
  p(q1, "Luz", 24000, "servicios", 15);
  p(q1, "Comida 1ª quincena", 120000, "vida", 7);

  p(q2, "Expensas", 95000, "vivienda", 22);
  if (viva(mes, "2026-11")) p(q2, "Círculo", 100000, "circulo", 22);
  p(q2, "Psicóloga (2ª mitad)", 74000, "salud", 22);
  if (["2026-09", "2026-11", "2027-01", "2027-03", "2027-05"].includes(mes))
    p(q2, "Psiquiatra", 63000, "salud", 22);
  p(q2, "Pastillas", 200000, "salud", 22);
  p(q2, "Gas", 4000, "servicios", 16);
  p(q2, "Internet", 47000, "servicios", 20);
  p(q2, "Comida 2ª quincena", 120000, "vida", 22);
  return { q1, q2 };
}

function ingresosExtraDefault(mes, q) {
  const out = [];
  if ((mes === "2026-09" || mes === "2026-10") && q === "q1")
    out.push({ id: uid(), nombre: "Devolución hermano (tablet)", monto: 31000 });
  if ((mes === "2026-09" || mes === "2026-10") && q === "q2")
    out.push({ id: uid(), nombre: "Devolución papá (tablet)", monto: 31000 });
  return out;
}

const MOVS_INICIALES = {
  visa: [
    { id: uid(), fecha: "01/08", detalle: "Farmacia (metilfenidato)", monto: 145962, cuota: "1 pago" },
    { id: uid(), fecha: "09/08", detalle: "Spotify", monto: 5800, cuota: "USD 3,71" },
    { id: uid(), fecha: "12/08", detalle: "Librería", monto: 20680, cuota: "1 pago" },
    { id: uid(), fecha: "12/08", detalle: "Dibox", monto: 42000, cuota: "1 pago" },
  ],
  master: [
    { id: uid(), fecha: "30/07", detalle: "Apple (Qobuz)", monto: 11000, cuota: "USD 6,99" },
    { id: uid(), fecha: "01/08", detalle: "PedidosYa", monto: 20680, cuota: "1 pago" },
    { id: uid(), fecha: "02/08", detalle: "Cartera Agarrate Catalina", monto: 9840, cuota: "1 de 6" },
    { id: uid(), fecha: "02/08", detalle: "Propina PedidosYa", monto: 900, cuota: "1 pago" },
    { id: uid(), fecha: "14/08", detalle: "Claude", monto: 31000, cuota: "USD 20" },
  ],
};

function estadoInicial() {
  const meses = {};
  LISTA_MESES.forEach((m) => {
    const d = pagosDefault(m);
    meses[m] = {
      q1: { ingreso: m === "2026-08" ? 1020000 : null, extras: [], ingresosExtra: ingresosExtraDefault(m, "q1"), pagos: d.q1 },
      q2: { ingreso: m === "2026-08" ? 934000 : null, extras: [], ingresosExtra: ingresosExtraDefault(m, "q2"), pagos: d.q2 },
    };
  });
  return {
    config: { valorHora: 6974, objetivo: 2500000, cotizCompra: 0, cotizVenta: 0 },
    meses, fondo: { compras: [] },
    mp: { saldoInicial: 233672.3, abonos: [] },
    tarjetas: MOVS_INICIALES,
  };
}

function migrar(d) {
  const base = estadoInicial();
  if (!d || typeof d !== "object") return base;
  if (!d.config) d.config = base.config;
  if (d.config.objetivo === undefined) d.config.objetivo = 2500000;
  if (d.config.valorHora === undefined) d.config.valorHora = 6974;
  if (d.config.cotizCompra === undefined) d.config.cotizCompra = 0;
  if (d.config.cotizVenta === undefined) d.config.cotizVenta = 0;
  if (!d.fondo || !Array.isArray(d.fondo.compras)) d.fondo = { compras: [] };
  if (!d.mp || !Array.isArray(d.mp.abonos)) d.mp = base.mp;
  if (!d.meses) d.meses = base.meses;
  if (!d.tarjetas) d.tarjetas = base.tarjetas;
  if (!d.tarjetas.visa) d.tarjetas.visa = [];
  if (!d.tarjetas.master) d.tarjetas.master = [];
  LISTA_MESES.forEach((m) => {
    if (!d.meses[m]) d.meses[m] = base.meses[m];
    ["q1", "q2"].forEach((qk) => {
      const q = d.meses[m][qk];
      if (!q.extras) q.extras = [];
      if (!q.ingresosExtra) q.ingresosExtra = [];
      q.pagos.forEach((p) => {
        if (p.nota === undefined) p.nota = "";
        if (p.fechaPago === undefined) p.fechaPago = "";
      });
    });
  });
  return d;
}

const KEY = "plan-candi-v1";

/* ───────── piezas reutilizables ───────── */
const inputCls = "px-3 py-2 rounded-xl border-2 border-pink-100 bg-pink-50/40 text-sm outline-none focus:border-violet-300 w-full text-slate-700";
const btnCls = "py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-fuchsia-400 text-white font-bold text-sm flex items-center justify-center gap-1.5";

function Monto({ valor, onChange, grande }) {
  const [edit, setEdit] = useState(false);
  const [txt, setTxt] = useState("");
  const base = grande
    ? "font-bold text-lg bg-emerald-50 border-emerald-200"
    : "font-semibold text-sm bg-violet-50 border-violet-200";
  if (edit)
    return (
      <input autoFocus inputMode="numeric" value={txt}
        className={"w-28 px-2 py-1 rounded-lg border-2 border-violet-400 outline-none " + (grande ? "text-lg font-bold" : "text-sm font-semibold")}
        onChange={(e) => setTxt(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={() => { onChange(Number(txt) || 0); setEdit(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }} />
    );
  return (
    <button onClick={() => { setTxt(String(Math.round(valor || 0))); setEdit(true); }}
      className={"inline-flex items-center gap-1 px-2 py-1 rounded-lg border-2 border-dashed text-slate-700 whitespace-nowrap " + base}>
      {fmt(valor)} <Pencil size={11} className="opacity-40" />
    </button>
  );
}

const Card = ({ children, className = "" }) => (
  <div className={"bg-white border-2 border-pink-100 rounded-3xl p-4 mb-3 shadow-sm " + className}>{children}</div>
);

/* formulario para agregar un pago */
function FormPago({ onAdd, secDefault = "otros", conSeccion = true }) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [dia, setDia] = useState("");
  const [sec, setSec] = useState(secDefault);
  const enviar = () => {
    if (!nombre.trim()) return;
    onAdd({ id: uid(), nombre: nombre.trim(), monto: Number(monto) || 0, seccion: sec, dia: Number(dia) || 0, pagado: false, nota: "", fechaPago: "" });
    setNombre(""); setMonto(""); setDia(""); setAbierto(false);
  };
  if (!abierto)
    return (
      <button onClick={() => setAbierto(true)} className="text-fuchsia-500 font-semibold text-xs py-2 flex items-center gap-1">
        <Plus size={13} /> agregar pago
      </button>
    );
  return (
    <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-pink-50/50 rounded-2xl border-2 border-pink-100">
      <input className={inputCls + " col-span-2"} placeholder="¿Qué pago?" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input className={inputCls} inputMode="numeric" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value.replace(/[^\d]/g, ""))} />
      <input className={inputCls} inputMode="numeric" placeholder="Día (ej: 22)" value={dia} onChange={(e) => setDia(e.target.value.replace(/[^\d]/g, ""))} />
      {conSeccion && (
        <select className={inputCls + " col-span-2"} value={sec} onChange={(e) => setSec(e.target.value)}>
          {CLAVES_SEC.map((k) => <option key={k} value={k}>{SECCIONES[k].nombre}</option>)}
        </select>
      )}
      <button className={btnCls} onClick={enviar}><Plus size={14} /> Agregar</button>
      <button className="py-2.5 rounded-xl border-2 border-pink-100 text-slate-500 font-semibold text-sm" onClick={() => setAbierto(false)}>Cancelar</button>
    </div>
  );
}

/* formulario ingreso extra */
function FormIngreso({ onAdd }) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  if (!abierto)
    return (
      <button onClick={() => setAbierto(true)} className="text-emerald-600 font-semibold text-xs py-2 flex items-center gap-1">
        <Plus size={13} /> ingreso extra
      </button>
    );
  return (
    <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-emerald-50/60 rounded-2xl border-2 border-emerald-100">
      <input className={inputCls + " col-span-2"} placeholder="¿Qué ingreso? (devolución, venta...)" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input className={inputCls + " col-span-2"} inputMode="numeric" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value.replace(/[^\d]/g, ""))} />
      <button className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-1.5"
        onClick={() => { if (!nombre.trim()) return; onAdd({ id: uid(), nombre: nombre.trim(), monto: Number(monto) || 0 }); setNombre(""); setMonto(""); setAbierto(false); }}>
        <Plus size={14} /> Agregar
      </button>
      <button className="py-2.5 rounded-xl border-2 border-pink-100 text-slate-500 font-semibold text-sm" onClick={() => setAbierto(false)}>Cancelar</button>
    </div>
  );
}

/* fila de pago con edición completa */
function PagoRow({ pago, onUpdate, onDelete, subtitulo }) {
  const [abierto, setAbierto] = useState(false);
  const s = SECCIONES[pago.seccion] || SECCIONES.otros;
  return (
    <div className="border-b border-dashed border-pink-100">
      <div className="flex items-center gap-2.5 py-2">
        <button onClick={() => onUpdate({ ...pago, pagado: !pago.pagado, fechaPago: !pago.pagado ? (pago.fechaPago || hoy()) : "" })}
          className={"w-6 h-6 shrink-0 rounded-lg border-2 grid place-items-center " + s.borde + " " + (pago.pagado ? s.punto : "bg-transparent")}>
          {pago.pagado && <Check size={13} className="text-white" strokeWidth={3.5} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className={"text-[13px] leading-tight " + (pago.pagado ? "line-through text-slate-300" : "text-slate-700")}>{pago.nombre}</div>
          <div className="text-[11px] flex flex-wrap gap-x-2">
            <span className={s.texto}>{subtitulo || (s.nombre + (pago.dia ? " · día " + pago.dia : ""))}</span>
            {pago.pagado && pago.fechaPago && <span className="text-emerald-600">pagado {pago.fechaPago}</span>}
          </div>
          {pago.nota && <div className="text-[11px] text-slate-400 italic">{pago.nota}</div>}
        </div>
        <Monto valor={pago.monto} onChange={(v) => onUpdate({ ...pago, monto: v })} />
        <button className="text-violet-300 hover:text-violet-500" onClick={() => setAbierto(!abierto)}>
          {abierto ? <X size={14} /> : <Pencil size={14} />}
        </button>
      </div>
      {abierto && (
        <div className="grid grid-cols-2 gap-2 pb-3 px-1">
          <input className={inputCls + " col-span-2"} value={pago.nombre} placeholder="Nombre"
            onChange={(e) => onUpdate({ ...pago, nombre: e.target.value })} />
          <input className={inputCls} inputMode="numeric" value={pago.dia || ""} placeholder="Día"
            onChange={(e) => onUpdate({ ...pago, dia: Number(e.target.value.replace(/[^\d]/g, "")) || 0 })} />
          <select className={inputCls} value={pago.seccion} onChange={(e) => onUpdate({ ...pago, seccion: e.target.value })}>
            {CLAVES_SEC.map((k) => <option key={k} value={k}>{SECCIONES[k].nombre}</option>)}
          </select>
          <input className={inputCls} value={pago.fechaPago || ""} placeholder="Fecha en que pagué"
            onChange={(e) => onUpdate({ ...pago, fechaPago: e.target.value })} />
          <input className={inputCls} value={pago.nota || ""} placeholder="Nota (ej: adelantado)"
            onChange={(e) => onUpdate({ ...pago, nota: e.target.value })} />
          <button className="col-span-2 py-2 rounded-xl border-2 border-rose-200 text-rose-500 font-semibold text-sm flex items-center justify-center gap-1.5"
            onClick={onDelete}><Trash2 size={14} /> Eliminar este pago</button>
        </div>
      )}
    </div>
  );
}

/* movimientos de tarjeta */
function MovimientosTarjeta({ tarjeta, movs, onAdd, onUpdate, onDelete }) {
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ fecha: "", detalle: "", monto: "", cuota: "" });
  const total = movs.reduce((s, m) => s + (m.monto || 0), 0);
  return (
    <Card>
      <h3 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
        <Receipt size={15} /> Movimientos del período
      </h3>
      <p className="text-xs text-slate-400 mb-2">Lo que va cayendo en el próximo resumen.</p>
      {movs.length === 0 && <p className="text-sm text-slate-400 py-1">Sin movimientos cargados.</p>}
      {movs.map((m) => (
        <div key={m.id} className="flex items-center gap-2 py-2 border-b border-dashed border-pink-100">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-slate-700">{m.detalle}</div>
            <div className="text-[11px] text-slate-400">{m.fecha}{m.cuota ? " · " + m.cuota : ""}</div>
          </div>
          <Monto valor={m.monto} onChange={(v) => onUpdate({ ...m, monto: v })} />
          <button className="text-pink-200 hover:text-rose-400" onClick={() => onDelete(m.id)}><Trash2 size={13} /></button>
        </div>
      ))}
      <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-pink-100 text-sm">
        <span className="text-slate-500">Total del período</span>
        <strong className="text-slate-700 text-base">{fmt(total)}</strong>
      </div>
      {!abierto ? (
        <button onClick={() => setAbierto(true)} className="text-fuchsia-500 font-semibold text-xs py-2 mt-1 flex items-center gap-1">
          <Plus size={13} /> agregar movimiento
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-pink-50/50 rounded-2xl border-2 border-pink-100">
          <input className={inputCls + " col-span-2"} placeholder="Detalle (ej: Farmacia)" value={f.detalle} onChange={(e) => setF({ ...f, detalle: e.target.value })} />
          <input className={inputCls} placeholder="Fecha (12/08)" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
          <input className={inputCls} inputMode="numeric" placeholder="Monto" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value.replace(/[^\d]/g, "") })} />
          <input className={inputCls + " col-span-2"} placeholder="Cuota (ej: 1 de 6 / 1 pago)" value={f.cuota} onChange={(e) => setF({ ...f, cuota: e.target.value })} />
          <button className={btnCls} onClick={() => {
            if (!f.detalle.trim()) return;
            onAdd({ id: uid(), fecha: f.fecha, detalle: f.detalle.trim(), monto: Number(f.monto) || 0, cuota: f.cuota });
            setF({ fecha: "", detalle: "", monto: "", cuota: "" }); setAbierto(false);
          }}><Plus size={14} /> Agregar</button>
          <button className="py-2.5 rounded-xl border-2 border-pink-100 text-slate-500 font-semibold text-sm" onClick={() => setAbierto(false)}>Cancelar</button>
        </div>
      )}
    </Card>
  );
}

/* quincena */
function Quincena({ q, titulo, cobro, mpVivo, upd }) {
  const extras = q.extras.reduce((s, x) => s + (x.monto || 0), 0);
  const extraIng = q.ingresosExtra.reduce((s, x) => s + (x.monto || 0), 0);
  const total = q.pagos.reduce((s, p) => s + (p.monto || 0), 0);
  const pagado = q.pagos.filter((p) => p.pagado).reduce((s, p) => s + (p.monto || 0), 0);
  const saldo = (q.ingreso || 0) + extras + extraIng - total;
  const orden = [...q.pagos].sort((a, b) => (a.dia || 0) - (b.dia || 0));
  return (
    <Card>
      <div className="flex justify-between items-start gap-3 mb-2">
        <div>
          <h3 className="font-bold text-slate-700">{titulo}</h3>
          <span className="text-xs text-slate-400">cobrás ~ el {cobro}</span>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 mb-0.5">Cobré</div>
          <Monto grande valor={q.ingreso || 0} onChange={(v) => upd((qq) => { qq.ingreso = v; })} />
        </div>
      </div>

      {q.ingresosExtra.map((x) => (
        <div key={x.id} className="flex items-center gap-2 text-sm py-1.5 border-b border-dashed border-pink-100">
          <span className="flex-1 text-slate-600">{x.nombre}</span>
          <Monto valor={x.monto} onChange={(v) => upd((qq) => { qq.ingresosExtra.find((i) => i.id === x.id).monto = v; })} />
          <button className="text-pink-200 hover:text-rose-400"
            onClick={() => upd((qq) => { qq.ingresosExtra = qq.ingresosExtra.filter((i) => i.id !== x.id); })}><Trash2 size={13} /></button>
        </div>
      ))}
      {extras > 0 && (
        <div className="flex justify-between text-sm py-1.5 border-b border-dashed border-pink-100">
          <span className="text-slate-600">Horas extras</span>
          <span className="text-emerald-600 font-semibold">+{fmt(extras)}</span>
        </div>
      )}
      <FormIngreso onAdd={(x) => upd((qq) => { qq.ingresosExtra.push(x); })} />

      <div className="mt-1">
        {orden.map((p) => (
          <PagoRow key={p.id} pago={p}
            onUpdate={(np) => upd((qq) => { const i = qq.pagos.findIndex((x) => x.id === p.id); qq.pagos[i] = np; })}
            onDelete={() => upd((qq) => { qq.pagos = qq.pagos.filter((x) => x.id !== p.id); })} />
        ))}
      </div>
      <FormPago onAdd={(np) => upd((qq) => { qq.pagos.push(np); })} />

      <div className="grid grid-cols-4 gap-1.5 mt-2">
        {[["A pagar", fmt(total), "text-slate-700"],
          ["Pagué", fmt(pagado), "text-violet-500"],
          ["Falta", fmt(total - pagado), "text-orange-500"]].map(([l, v, c]) => (
          <div key={l} className="bg-pink-50/60 border border-pink-100 rounded-xl py-2 px-1 text-center">
            <div className="text-[10px] text-slate-400">{l}</div>
            <div className={"font-bold text-[12px] " + c}>{v}</div>
          </div>
        ))}
        <div className={"rounded-xl py-2 px-1 text-center border " + (saldo >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200")}>
          <div className="text-[10px] text-slate-400">Saldo</div>
          <div className={"font-bold text-[12px] " + (saldo >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {saldo >= 0 ? "+" : "−"}{fmt(Math.abs(saldo))}
          </div>
        </div>
      </div>

      {q.ingreso > 0 && saldo > 0 && (
        <div className="flex gap-2 mt-3 p-3 bg-violet-50 border-2 border-violet-100 rounded-2xl text-[12.5px] text-violet-800 leading-relaxed">
          <Sparkles size={14} className="shrink-0 mt-0.5" />
          {mpVivo > 0
            ? <span>Te sobran {fmt(saldo)} → primero Mercado Pago (viva: {fmt(mpVivo)}), lo demás al caldero.</span>
            : <span>Te sobran {fmt(saldo)} → ¡directo al caldero! Comprá dólares y registralos.</span>}
        </div>
      )}
      {q.ingreso > 0 && saldo < 0 && (
        <div className="flex gap-2 mt-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-2xl text-[12.5px] text-orange-800 leading-relaxed">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>Faltan {fmt(Math.abs(saldo))}. Revisá qué mover a la próxima quincena — nunca la comida ni la vivienda.</span>
        </div>
      )}
    </Card>
  );
}

/* mercado pago */
function MPTab({ data, set, mpVivo }) {
  const [f, setF] = useState({ fecha: "", monto: "", nota: "" });
  const inicial = data.mp.saldoInicial || 0;
  let acum = inicial;
  const hist = data.mp.abonos.map((a) => { acum = Math.max(0, acum - (a.monto || 0)); return { ...a, saldo: acum }; });
  const pagado = inicial - mpVivo;
  const pct = inicial ? (pagado / inicial) * 100 : 0;
  return (
    <>
      <Card>
        <h3 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2"><Wallet size={15} /> Deuda viva</h3>
        <div className="text-3xl font-bold text-sky-600">{fmt(mpVivo)}</div>
        <div className="h-2 bg-purple-100 rounded-full overflow-hidden my-2">
          <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all" style={{ width: Math.min(100, pct) + "%" }} />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-pink-50/60 border border-pink-100 rounded-xl py-2 text-center">
            <div className="text-[10px] text-slate-400 mb-1">Original</div>
            <Monto valor={inicial} onChange={(v) => set((d) => { d.mp.saldoInicial = v; })} />
          </div>
          <div className="bg-pink-50/60 border border-pink-100 rounded-xl py-2 text-center">
            <div className="text-[10px] text-slate-400">Ya pagaste</div>
            <div className="font-bold text-[13px] text-emerald-600">{fmt(pagado)}</div>
          </div>
          <div className="bg-pink-50/60 border border-pink-100 rounded-xl py-2 text-center">
            <div className="text-[10px] text-slate-400">Avance</div>
            <div className="font-bold text-[13px] text-slate-700">{Math.round(pct)}%</div>
          </div>
        </div>
        <div className={"flex gap-2 mt-3 p-3 rounded-2xl text-[12.5px] leading-relaxed border-2 " + (mpVivo === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-violet-50 border-violet-100 text-violet-800")}>
          {mpVivo === 0 ? <Sparkles size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
          <span>{mpVivo === 0
            ? "¡Mercado Pago en cero! Desde ahora todo excedente va derecho al caldero."
            : "Esta línea cobra cerca del 200% anual. Cada pago acá rinde más que cualquier inversión."}</span>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2"><Plus size={15} /> Registrar un pago</h3>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} placeholder="Fecha (22/08)" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
          <input className={inputCls} inputMode="numeric" placeholder="Monto" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value.replace(/[^\d]/g, "") })} />
          <input className={inputCls + " col-span-2"} placeholder="Nota (ej: adelanto con excedente)" value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} />
          <button className={btnCls + " col-span-2"} onClick={() => {
            const m = Number(f.monto); if (!m) return;
            set((d) => d.mp.abonos.push({ id: uid(), fecha: f.fecha || hoy(), monto: m, nota: f.nota.trim() }));
            setF({ fecha: "", monto: "", nota: "" });
          }}><Plus size={14} /> Agregar pago</button>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2"><Clock size={15} /> Historial</h3>
        {hist.length === 0 && <p className="text-sm text-slate-400 py-2">Todavía no registraste pagos.</p>}
        {hist.map((a, i) => (
          <div key={a.id} className="flex items-center gap-2.5 py-2.5 border-b border-dashed border-pink-100">
            <div className="w-6 h-6 shrink-0 rounded-full bg-sky-100 text-sky-700 grid place-items-center text-[11px] font-bold">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-slate-700">{a.fecha}</div>
              {a.nota && <div className="text-[11px] text-slate-400 italic">{a.nota}</div>}
              <div className="text-[11px] text-slate-400">quedó en {fmt(a.saldo)}</div>
            </div>
            <Monto valor={a.monto} onChange={(v) => set((d) => { d.mp.abonos.find((x) => x.id === a.id).monto = v; })} />
            <button className="text-pink-200 hover:text-rose-400"
              onClick={() => set((d) => { d.mp.abonos = d.mp.abonos.filter((x) => x.id !== a.id); })}><Trash2 size={13} /></button>
          </div>
        ))}
        {hist.length > 0 && (
          <div className="flex justify-between items-center mt-3 pt-2.5 border-t-2 border-pink-100 text-sm">
            <span className="text-slate-500">Total en {hist.length} {hist.length === 1 ? "pago" : "pagos"}</span>
            <strong className="text-emerald-600 text-base">{fmt(pagado)}</strong>
          </div>
        )}
      </Card>
    </>
  );
}

/* sección */
function SeccionTab({ sec, data, set, mpVivo, mesKey }) {
  const s = SECCIONES[sec];
  const [destino, setDestino] = useState({ mes: mesKey, q: "q1" });
  const filas = [];
  LISTA_MESES.forEach((m) => ["q1", "q2"].forEach((qk) =>
    data.meses[m][qk].pagos.forEach((p) => { if (p.seccion === sec) filas.push({ m, qk, p }); })));
  const cuotas = CUOTAS_INFO.filter((c) => c.tarjeta === sec);
  return (
    <div>
      <div className={"flex items-center gap-2.5 border-2 rounded-2xl px-4 py-3 mb-3 " + s.fondo + " " + s.borde}>
        <s.Icono size={20} className={s.texto} />
        <h2 className="font-bold text-slate-700">{s.nombre}</h2>
      </div>

      {sec === "mp" && <MPTab data={data} set={set} mpVivo={mpVivo} />}

      {(sec === "visa" || sec === "master") && (
        <MovimientosTarjeta tarjeta={sec} movs={data.tarjetas[sec]}
          onAdd={(m) => set((d) => d.tarjetas[sec].push(m))}
          onUpdate={(m) => set((d) => { const i = d.tarjetas[sec].findIndex((x) => x.id === m.id); d.tarjetas[sec][i] = m; })}
          onDelete={(id) => set((d) => { d.tarjetas[sec] = d.tarjetas[sec].filter((x) => x.id !== id); })} />
      )}

      {cuotas.length > 0 && (
        <Card>
          <h3 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2"><Clock size={15} /> Cuotas comprometidas</h3>
          {cuotas.map((c) => (
            <div key={c.nombre} className="flex justify-between items-center text-sm py-2 border-b border-dashed border-pink-100">
              <span className="text-slate-700">{c.nombre}</span>
              <span className="text-slate-500 text-xs">{fmt(c.monto)}/mes · hasta {MES_LABEL(c.fin)}</span>
            </div>
          ))}
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-slate-700 mb-2">Pagos en el plan</h3>
        {filas.length === 0 && <p className="text-sm text-slate-400">No hay pagos de esta sección.</p>}
        {filas.map(({ m, qk, p }) => (
          <PagoRow key={p.id} pago={p}
            subtitulo={MES_LABEL(m) + " · " + (qk === "q1" ? "1ª quincena" : "2ª quincena")}
            onUpdate={(np) => set((d) => { const i = d.meses[m][qk].pagos.findIndex((x) => x.id === p.id); d.meses[m][qk].pagos[i] = np; })}
            onDelete={() => set((d) => { d.meses[m][qk].pagos = d.meses[m][qk].pagos.filter((x) => x.id !== p.id); })} />
        ))}

        <div className="mt-3 pt-3 border-t-2 border-pink-100">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">Agregar a:</span>
            <select className="px-2 py-1.5 rounded-lg border-2 border-pink-100 bg-pink-50/40 text-xs outline-none"
              value={destino.mes} onChange={(e) => setDestino({ ...destino, mes: e.target.value })}>
              {LISTA_MESES.map((m) => <option key={m} value={m}>{MES_LABEL(m)}</option>)}
            </select>
            <select className="px-2 py-1.5 rounded-lg border-2 border-pink-100 bg-pink-50/40 text-xs outline-none"
              value={destino.q} onChange={(e) => setDestino({ ...destino, q: e.target.value })}>
              <option value="q1">1ª quincena</option>
              <option value="q2">2ª quincena</option>
            </select>
          </div>
          <FormPago secDefault={sec} conSeccion={false}
            onAdd={(np) => set((d) => d.meses[destino.mes][destino.q].pagos.push({ ...np, seccion: sec }))} />
        </div>
      </Card>
    </div>
  );
}

/* horas extras */
function ExtrasTab({ data, set, mesKey }) {
  const [f, setF] = useState({ q: "q1", fecha: "", horas: "", tipo: "50" });
  const total = LISTA_MESES.reduce((s, m) => s + ["q1", "q2"].reduce((a, qk) =>
    a + data.meses[m][qk].extras.reduce((b, x) => b + (x.monto || 0), 0), 0), 0);
  const mes = data.meses[mesKey];
  return (
    <div>
      <div className="flex items-center gap-2.5 border-2 border-amber-300 bg-amber-50 rounded-2xl px-4 py-3 mb-3">
        <Clock size={20} className="text-amber-500" />
        <h2 className="font-bold text-slate-700">Horas extras</h2>
      </div>
      <div className="bg-gradient-to-br from-amber-400 to-orange-400 text-white rounded-3xl p-4 mb-3">
        <div className="text-xs opacity-90">Ganado en extras (todo el plan)</div>
        <div className="text-3xl font-bold">{fmt(total)}</div>
      </div>
      <Card>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-slate-600">Valor de tu hora</span>
          <Monto valor={data.config.valorHora} onChange={(v) => set((d) => { d.config.valorHora = v; })} />
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mt-1">
          Feriado trabajado se paga al 100% (doble). Hora al 50% = valor × 1,5. Está en tu recibo como "Remuneración Básica".
        </p>
      </Card>
      <Card>
        <h3 className="font-bold text-slate-700 mb-2">Cargar extras de {MES_LABEL(mesKey)}</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <select className={inputCls} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })}>
            <option value="q1">1ª quincena</option>
            <option value="q2">2ª quincena</option>
          </select>
          <select className={inputCls} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
            <option value="normal">Normales</option>
            <option value="50">Al 50%</option>
            <option value="100">Al 100% (feriado)</option>
          </select>
          <input className={inputCls} placeholder="Fecha (17/08)" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
          <input className={inputCls} inputMode="numeric" placeholder="Horas" value={f.horas} onChange={(e) => setF({ ...f, horas: e.target.value.replace(/[^\d]/g, "") })} />
          <button className={btnCls + " col-span-2"} onClick={() => {
            const h = Number(f.horas); if (!h) return;
            const mult = f.tipo === "100" ? 2 : f.tipo === "50" ? 1.5 : 1;
            const tipo = f.tipo === "100" ? "al 100%" : f.tipo === "50" ? "al 50%" : "normales";
            set((d) => d.meses[mesKey][f.q].extras.push({
              id: uid(), fecha: f.fecha, horas: h, tipo, monto: Math.round(h * data.config.valorHora * mult),
            }));
            setF({ ...f, fecha: "", horas: "" });
          }}><Plus size={14} /> Agregar horas</button>
        </div>
        {["q1", "q2"].map((qk) => (
          <div key={qk} className="mt-2">
            <h4 className="text-[13px] font-semibold text-fuchsia-500">{qk === "q1" ? "1ª quincena" : "2ª quincena"}</h4>
            {mes[qk].extras.length === 0 && <p className="text-xs text-slate-400 py-1">Sin extras cargadas.</p>}
            {mes[qk].extras.map((x) => (
              <div key={x.id} className="flex items-center gap-2 text-sm py-1.5 border-b border-dashed border-pink-100">
                <span className="flex-1 text-slate-600">{x.fecha} · {x.horas} hs {x.tipo}</span>
                <Monto valor={x.monto} onChange={(v) => set((d) => { d.meses[mesKey][qk].extras.find((i) => i.id === x.id).monto = v; })} />
                <button className="text-pink-200 hover:text-rose-400" onClick={() => set((d) => {
                  d.meses[mesKey][qk].extras = d.meses[mesKey][qk].extras.filter((i) => i.id !== x.id);
                })}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        ))}
        <p className="text-xs text-slate-400 mt-2">Las extras se suman solas al ingreso de esa quincena.</p>
      </Card>
    </div>
  );
}

/* caldero */
function Caldero({ pct }) {
  const n = Math.max(0, Math.min(1, pct));
  const y = 150 - n * 88;
  return (
    <svg viewBox="0 0 200 200" className="w-52 h-52">
      <defs>
        <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9A8D4" />
          <stop offset="55%" stopColor="#E879F9" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <clipPath id="panza">
          <path d="M38 66 Q30 92 34 118 Q40 152 100 156 Q160 152 166 118 Q170 92 162 66 Q131 78 100 78 Q69 78 38 66 Z" />
        </clipPath>
      </defs>
      <path d="M60 156 L50 176 L64 176 Z" fill="#6D5A7E" />
      <path d="M140 156 L150 176 L136 176 Z" fill="#6D5A7E" />
      <path d="M96 158 L94 178 L108 178 L104 158 Z" fill="#6D5A7E" />
      <path d="M38 66 Q30 92 34 118 Q40 152 100 156 Q160 152 166 118 Q170 92 162 66 Q131 78 100 78 Q69 78 38 66 Z" fill="#8B7399" />
      <g clipPath="url(#panza)">
        <rect x="20" y={y} width="160" height="120" fill="url(#liq)">
          <animate attributeName="y" values={`${y};${y - 3};${y}`} dur="3s" repeatCount="indefinite" />
        </rect>
        {n > 0.03 && (
          <>
            <circle cx="75" r="5" fill="#FDF2F8" opacity="0.75" cy={y + 26}>
              <animate attributeName="cy" values={`${y + 30};${y + 6}`} dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.75;0" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="115" r="4" fill="#FDF2F8" opacity="0.7" cy={y + 34}>
              <animate attributeName="cy" values={`${y + 36};${y + 8}`} dur="3.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur="3.4s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </g>
      <ellipse cx="100" cy="66" rx="64" ry="14" fill="#6D5A7E" />
      <ellipse cx="100" cy="63" rx="64" ry="14" fill="#A48BB8" />
      <ellipse cx="100" cy="63" rx="52" ry="10" fill={n > 0 ? "url(#liq)" : "#5C4A6E"} />
      <path d="M34 74 Q18 80 26 96" stroke="#6D5A7E" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M166 74 Q182 80 174 96" stroke="#6D5A7E" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M52 34 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#F9A8D4" />
      <path d="M150 26 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4 Z" fill="#A78BFA" />
      <circle cx="108" cy="22" r="3" fill="#E879F9" />
    </svg>
  );
}

function CalderoTab({ data, set }) {
  const [f, setF] = useState({ fecha: "", pesos: "", cotiz: "" });
  const pesos = data.fondo.compras.reduce((s, c) => s + (c.pesos || 0), 0);
  const usd = data.fondo.compras.reduce((s, c) => s + (c.usd || 0), 0);
  const pct = data.config.objetivo ? pesos / data.config.objetivo : 0;
  return (
    <div>
      <div className="flex items-center gap-2.5 border-2 border-fuchsia-300 bg-fuchsia-50 rounded-2xl px-4 py-3 mb-3">
        <FlaskConical size={20} className="text-fuchsia-600" />
        <h2 className="font-bold text-slate-700">El caldero</h2>
      </div>
      <Card className="flex flex-col items-center">
        <Caldero pct={pct} />
        <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent -mt-2">
          {Math.round(pct * 100)}%
        </div>
        <div className="grid grid-cols-3 gap-1.5 w-full mt-3">
          <div className="bg-pink-50/60 border border-pink-100 rounded-xl py-2 text-center">
            <div className="text-[10px] text-slate-400">Juntado</div>
            <div className="font-bold text-[13px] text-slate-700">{fmt(pesos)}</div>
          </div>
          <div className="bg-pink-50/60 border border-pink-100 rounded-xl py-2 text-center">
            <div className="text-[10px] text-slate-400">En dólares</div>
            <div className="font-bold text-[13px] text-slate-700">{fmtUsd(usd)}</div>
          </div>
          <div className="bg-pink-50/60 border border-pink-100 rounded-xl py-2 text-center">
            <div className="text-[10px] text-slate-400 mb-1">Objetivo</div>
            <Monto valor={data.config.objetivo} onChange={(v) => set((d) => { d.config.objetivo = v; })} />
          </div>
        </div>
        <p className="text-xs text-slate-400 text-center mt-3">Meta: renovar el contrato o mudarte en diciembre.</p>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1"><Coins size={15} /> Cotización dólar MEP</h3>
        {[["Compra", "cotizCompra"], ["Venta", "cotizVenta"]].map(([l, k]) => (
          <div key={k} className="flex justify-between items-center py-2 border-b border-dashed border-pink-100">
            <span className="text-sm text-slate-600">{l}</span>
            <Monto valor={data.config[k]} onChange={(v) => set((d) => { d.config[k] = v; })} />
          </div>
        ))}
        <p className="text-xs text-slate-400 leading-relaxed mt-2">
          Actualizala el día que compres: app Galicia → Inversiones → Dólar MEP. Comprá siempre después de cobrar — pagate primero.
        </p>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2"><TrendingUp size={15} /> Mis compras de dólares</h3>
        {data.fondo.compras.length === 0 && <p className="text-sm text-slate-400">La primera piedra del fondo se pone acá.</p>}
        {data.fondo.compras.map((c) => (
          <div key={c.id} className="flex items-center gap-2 text-sm py-2 border-b border-dashed border-pink-100">
            <div className="flex-1 min-w-0">
              <div className="text-slate-700">{c.fecha}</div>
              <div className="text-[11px] text-slate-400">a {fmt(c.cotiz)} → {fmtUsd(c.usd)}</div>
            </div>
            <Monto valor={c.pesos} onChange={(v) => set((d) => {
              const it = d.fondo.compras.find((x) => x.id === c.id);
              it.pesos = v; it.usd = it.cotiz ? +(v / it.cotiz).toFixed(2) : 0;
            })} />
            <button className="text-pink-200 hover:text-rose-400"
              onClick={() => set((d) => { d.fondo.compras = d.fondo.compras.filter((x) => x.id !== c.id); })}><Trash2 size={13} /></button>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <input className={inputCls} placeholder="Fecha (22/08)" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
          <input className={inputCls} inputMode="numeric" placeholder="Pesos" value={f.pesos} onChange={(e) => setF({ ...f, pesos: e.target.value.replace(/[^\d]/g, "") })} />
          <input className={inputCls + " col-span-2"} inputMode="numeric" placeholder="Cotización a la que compraste" value={f.cotiz} onChange={(e) => setF({ ...f, cotiz: e.target.value.replace(/[^\d]/g, "") })} />
          <button className={btnCls + " col-span-2"} onClick={() => {
            const p = Number(f.pesos), c = Number(f.cotiz);
            if (!p || !c) return;
            set((d) => d.fondo.compras.push({ id: uid(), fecha: f.fecha || hoy(), pesos: p, cotiz: c, usd: +(p / c).toFixed(2) }));
            setF({ fecha: "", pesos: "", cotiz: "" });
          }}><Plus size={14} /> Registrar compra</button>
        </div>
      </Card>
    </div>
  );
}

/* ───────── app ───────── */
export default function App() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("resumen");
  const [mesIdx, setMesIdx] = useState(0);
  const [guardado, setGuardado] = useState(null);
  const primera = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(KEY);
        setData(r ? migrar(JSON.parse(r.value)) : estadoInicial());
      } catch (e) {
        setData(estadoInicial());
      }
      setCargando(false);
    })();
  }, []);

  useEffect(() => {
    if (!data) return;
    if (primera.current) { primera.current = false; return; }
    const t = setTimeout(async () => {
      try {
        await window.storage.set(KEY, JSON.stringify(data));
        const d = new Date();
        setGuardado(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"));
      } catch (e) { setGuardado("error"); }
    }, 600);
    return () => clearTimeout(t);
  }, [data]);

  if (cargando || !data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="animate-spin text-pink-400" size={32} />
      </div>
    );

  const set = (fn) => setData((d) => { const n = structuredClone(d); fn(n); return n; });
  const mesKey = LISTA_MESES[mesIdx];
  const mes = data.meses[mesKey];
  const updQ = (qk) => (fn) => set((d) => fn(d.meses[mesKey][qk]));

  const mpVivo = Math.max(0, data.mp.saldoInicial - data.mp.abonos.reduce((s, a) => s + (a.monto || 0), 0));
  const fondoPesos = data.fondo.compras.reduce((s, c) => s + (c.pesos || 0), 0);
  const fondoPct = data.config.objetivo ? fondoPesos / data.config.objetivo : 0;

  const tot = (q) => ({
    total: q.pagos.reduce((s, p) => s + (p.monto || 0), 0),
    pagado: q.pagos.filter((p) => p.pagado).reduce((s, p) => s + (p.monto || 0), 0),
  });
  const a = tot(mes.q1), b = tot(mes.q2);
  const totalMes = a.total + b.total, pagadoMes = a.pagado + b.pagado;

  const TABS = [
    { id: "resumen", n: "Resumen", I: LayoutGrid },
    { id: "caldero", n: "Caldero", I: FlaskConical },
    { id: "mp", n: "Mercado Pago", I: Wallet },
    { id: "vivienda", n: "Vivienda", I: Home },
    { id: "visa", n: "Visa", I: CreditCard },
    { id: "master", n: "Mastercard", I: CreditCard },
    { id: "salud", n: "Salud", I: HeartPulse },
    { id: "servicios", n: "Servicios", I: Lightbulb },
    { id: "circulo", n: "Círculo", I: Users },
    { id: "vida", n: "Vida diaria", I: ShoppingBasket },
    { id: "subs", n: "Suscripciones", I: Music },
    { id: "extras", n: "Horas extras", I: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-emerald-50 pb-20">
      <div className="max-w-xl mx-auto px-3.5 pt-4">
        <h1 className="text-xl font-bold text-slate-700">
          Plan Financiero <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Cotton Candy</span>
        </h1>
        <div className="flex gap-2 mt-2 flex-wrap">
          <button onClick={() => setTab("caldero")}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-pink-50 border-2 border-pink-200 text-pink-700">
            <PiggyBank size={13} /> Caldero {Math.round(fondoPct * 100)}%
          </button>
          <button onClick={() => setTab("mp")}
            className={"flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border-2 " + (mpVivo > 0 ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-emerald-50 border-emerald-200 text-emerald-700")}>
            <Wallet size={13} /> MP {mpVivo > 0 ? fmt(mpVivo) : "en cero"}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 py-3">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={"flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-semibold px-3 py-1.5 rounded-full border-2 transition " +
                (tab === t.id ? "bg-gradient-to-r from-pink-400 to-fuchsia-400 text-white border-transparent shadow" : "bg-white text-slate-400 border-pink-100")}>
              <t.I size={14} /> {t.n}
            </button>
          ))}
        </div>

        {tab === "resumen" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <button disabled={mesIdx === 0} onClick={() => setMesIdx(mesIdx - 1)}
                className="w-9 h-9 rounded-full border-2 border-pink-100 bg-white grid place-items-center disabled:opacity-30">
                <ChevronLeft size={18} className="text-slate-500" />
              </button>
              <h2 className="text-lg font-bold text-slate-700">{MES_LABEL(mesKey)}</h2>
              <button disabled={mesIdx === LISTA_MESES.length - 1} onClick={() => setMesIdx(mesIdx + 1)}
                className="w-9 h-9 rounded-full border-2 border-pink-100 bg-white grid place-items-center disabled:opacity-30">
                <ChevronRight size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 text-white rounded-3xl p-4 mb-3">
              <div className="text-xs opacity-90">Comprometido este mes</div>
              <div className="text-3xl font-bold">{fmt(totalMes)}</div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden my-1.5">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: Math.min(100, (pagadoMes / (totalMes || 1)) * 100) + "%" }} />
              </div>
              <div className="text-[11px] opacity-85">{fmt(pagadoMes)} ya pagado</div>
            </div>
            <Quincena q={mes.q1} titulo="1ª quincena" cobro="7" mpVivo={mpVivo} upd={updQ("q1")} />
            <Quincena q={mes.q2} titulo="2ª quincena" cobro="22" mpVivo={mpVivo} upd={updQ("q2")} />
          </>
        )}
        {["vivienda", "visa", "master", "mp", "salud", "servicios", "subs", "circulo", "vida"].includes(tab) &&
          <SeccionTab sec={tab} data={data} set={set} mpVivo={mpVivo} mesKey={mesKey} />}
        {tab === "extras" && <ExtrasTab data={data} set={set} mesKey={mesKey} />}
        {tab === "caldero" && <CalderoTab data={data} set={set} />}
      </div>

      <div className={"fixed bottom-4 right-4 flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full border-2 shadow " +
        (guardado === "error" ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-emerald-50 border-emerald-300 text-emerald-700")}>
        {guardado === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
        {guardado === "error" ? "No se pudo guardar" : guardado ? "Guardado " + guardado : "Se guarda solo"}
      </div>
    </div>
  );
}
