// 1. React Hooks aus dem globalen Objekt holen
const { useState, useEffect } = React;

// 2. Icons importieren
import { 
    ShoppingBag, Database, Plus, Settings, X, ChevronRight, 
    PenTool, FileSpreadsheet, Trash2, Save, ClipboardList, Check 
} from "https://esm.sh/lucide-react@0.294.0?deps=react@18.2.0";

// 3. Hilfs-Komponente für Icons (muss hier lokal definiert sein)
const SafeIcon = ({ name, size = 20, className = "" }) => {
    const Icons = { ShoppingBag, Database, Plus, Settings, X, ChevronRight, PenTool, FileSpreadsheet, Trash2, Save, ClipboardList, Check };
    const Icon = Icons[name];
    return Icon ? <Icon width={size} height={size} className={className} /> : null;
};
const SmartOrdering = ({ data, appId, showToast, user }) => {
    // --- KONFIGURATION ---
    const EMAILJS_SERVICE_ID = "service_dejsfye";
    const EMAILJS_TEMPLATE_ID = "template_mcithcs";
    const EMAILJS_PUBLIC_KEY = "TMFx2hP-RUgy_g9LC";

    // --- STATE ---
    const [view, setView] = useState('dashboard'); 
    const [selectedSup, setSelectedSup] = useState(null);
    const [editSup, setEditSup] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [cart, setCart] = useState({});
    const [openOrders, setOpenOrders] = useState([]); // Für die Warteschlange

    const suppliers = data?.suppliers || [];
    const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const todayIndex = new Date().getDay(); 
    const today = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][todayIndex];

    // --- ICONS (Statisch definiert um Abstürze zu verhindern) ---
    const Icons = {
        ShoppingBag: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
        Database: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
        Plus: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
        Settings: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
        X: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>,
        ChevronRight: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
        PenTool: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
        FileSpreadsheet: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>,
        Trash2: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
        Save: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
        ClipboardList: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>,
        Check: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    };

    const SafeIcon = ({ name, size = 20, className = "" }) => {
        const Icon = Icons[name];
        return Icon ? <Icon width={size} height={size} className={className} /> : null;
    };

    // --- FUNKTIONEN ---
    
    // Bestellungen laden (für Checkliste)
    useEffect(() => {
        if (view === 'checks') {
            const fetchOrders = async () => {
                const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                setOpenOrders(snap.docs.map(d => ({id: d.id, ...d.data()})));
            };
            fetchOrders();
        }
    }, [view, appId]);

    const syncSup = async (id, payload) => {
        try {
            const ref = doc(db, 'artifacts', appId, 'public', 'data', 'suppliers', id);
            await updateDoc(ref, { ...payload, lastUpdate: serverTimestamp() });
        } catch (e) { console.error(e); }
    };

    const handleAddProduct = () => {
        const newItem = {
            sku: Date.now().toString(),
            name: "Neues Produkt",
            unit: "Stk",
            cat: selectedSup.categories?.[0] || "Allgemein",
            targets: { Mo:0, Di:0, Mi:0, Do:0, Fr:0, Sa:0, So:0 }
        };
        const newCatalog = [...selectedSup.catalog, newItem];
        setSelectedSup({ ...selectedSup, catalog: newCatalog });
        setActiveItem(newItem);
        setView('edit_item');
        syncSup(selectedSup.id, { catalog: newCatalog });
    };

    const exportToExcel = (sup) => {
        try {
            if (!window.XLSX) return showToast("Excel lädt...", "error");
            const wsData = [
                ["LIEFERANT", sup.name, "KUNDEN-NR", sup.customerNumber],
                ["KATEGORIE", "ART-NR", "NAME", "EINHEIT", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
                ...sup.catalog.map(i => [
                    i.cat, i.sku, i.name, i.unit,
                    i.targets?.Mo||0, i.targets?.Di||0, i.targets?.Mi||0, i.targets?.Do||0, i.targets?.Fr||0, i.targets?.Sa||0, i.targets?.So||0
                ])
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Katalog");
            XLSX.writeFile(wb, `${sup.name}_Bestellliste.xlsx`);
            showToast("Excel Datei erstellt!");
        } catch (e) { showToast("Export Fehler", "error"); }
    };

    const handleSmartImport = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                if (!window.XLSX) return showToast("Excel fehlt", "error");
                const bdata = new Uint8Array(evt.target.result);
                const wb = XLSX.read(bdata, {type:'array'});
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, {header: 1});
                const sName = rows[0]?.[1] || "Unbekannt";
                
                const existing = suppliers.find(s => s.name === sName);
                if (existing && !confirm(`WARNUNG: "${sName}" existiert bereits.\nVerschmelzen?`)) return;

                let baseCatalog = existing ? [...existing.catalog] : [];
                const newItems = rows.slice(2).map(r => ({
                    cat: r[0] || 'Allgemein', sku: r[1]?.toString() || 'N/A', name: r[2], unit: r[3],
                    targets: { Mo:r[4]||0, Di:r[5]||0, Mi:r[6]||0, Do:r[7]||0, Fr:r[8]||0, Sa:r[9]||0, So:r[10]||0 }
                })).filter(i => i.name);

                newItems.forEach(newItem => {
                    const idx = baseCatalog.findIndex(item => item.sku === newItem.sku);
                    if (idx > -1) baseCatalog[idx].targets = { ...baseCatalog[idx].targets, ...newItem.targets };
                    else baseCatalog.push(newItem);
                });

                const supData = { name: sName, customerNumber: rows[0]?.[3] || "", catalog: baseCatalog, categories: [...new Set(baseCatalog.map(i => i.cat))] };
                if(existing) await syncSup(existing.id, supData);
                else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'suppliers'), supData);
                showToast("Import erfolgreich!");
            } catch (err) { console.error(err); showToast("Import Fehler", "error"); }
        };
        reader.readAsArrayBuffer(file);
    };

    const finalizeOrder = async () => {
        const orderItems = selectedSup.catalog.filter(i => cart[i.sku] > 0);
        if (orderItems.length === 0) return showToast("Leer", "error");
        
        const companyName = data?.company?.name || "Gastronomiebetrieb";
        const logoUrl = data?.company?.logoUrl || "";
        const dateStr = new Date().toLocaleDateString('de-DE');

        const orderTableHTML = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 2px solid #e2e8f0;">
                ${logoUrl ? `<img src="${logoUrl}" style="height: 60px; object-fit: contain;" />` : ''}
                <h2 style="margin: 5px 0; color: #0f172a;">BESTELLUNG</h2>
                <p style="margin: 0; color: #475569;">${companyName}</p>
                <p style="margin: 0; font-size: 14px; color: #94a3b8;">${dateStr}</p>
            </div>
            <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin-top: 20px;">
                <thead style="background-color: #f1f5f9;"><tr><th style="text-align: left; border-bottom: 2px solid #ddd;">Menge</th><th style="text-align: left; border-bottom: 2px solid #ddd;">Einh.</th><th style="text-align: left; border-bottom: 2px solid #ddd;">Artikel</th><th style="text-align: right; border-bottom: 2px solid #ddd;">Art-Nr.</th></tr></thead>
                <tbody>
                    ${orderItems.map((i, idx) => `<tr style="background-color: ${idx % 2 === 0 ? '#fff' : '#f9fafb'};"><td style="border-bottom: 1px solid #eee; font-weight: bold;">${cart[i.sku]}</td><td style="border-bottom: 1px solid #eee;">${i.unit}</td><td style="border-bottom: 1px solid #eee;">${i.name}</td><td style="border-bottom: 1px solid #eee; text-align: right;">${i.sku}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>`;

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                supplier_name: selectedSup.name, to_email: selectedSup.email, order_details: orderTableHTML,
                customer_number: selectedSup.customerNumber || "N/A", company_name: companyName
            }, EMAILJS_PUBLIC_KEY);
            
            // 1. In Warteschlange speichern
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
                supplierName: selectedSup.name,
                items: orderItems.map(i => ({ name: i.name, amount: cart[i.sku], unit: i.unit })),
                createdAt: serverTimestamp(),
                checked: false
            });

            // 2. Lieferant aktualisieren (Badge Logic: lastOrderedAt setzen)
            await syncSup(selectedSup.id, { lastOrderedAt: serverTimestamp() });

            showToast("Bestellt & in Warteschlange!");
            setCart({}); setView('dashboard');
        } catch (e) { showToast("Sende-Fehler", "error"); }
    };

    // --- VIEW: WARTESCHLANGE (CHECKLISTE) ---
    if (view === 'checks') return (
        <div className="p-6 space-y-4 pb-32">
            <div className="flex justify-between items-center"><h2 className="text-xl font-black">Warenannahme</h2><button onClick={()=>setView('dashboard')}><SafeIcon name="X"/></button></div>
            {openOrders.length === 0 && <div className="text-center text-slate-400 mt-10">Keine offenen Lieferungen.</div>}
            {openOrders.map(order => (
                <div key={order.id} className="bg-white p-5 rounded-[2rem] border shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-lg">{order.supplierName}</h3>
                        <button onClick={async () => {
                            if(confirm("Lieferung vollständig?")){
                                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id));
                                setOpenOrders(openOrders.filter(o => o.id !== order.id));
                            }
                        }} className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><SafeIcon name="Check" size={14}/> OK</button>
                    </div>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm border-b border-slate-50 pb-1">
                                <span>{item.name}</span>
                                <span className="font-bold">{item.amount} {item.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    // --- VIEW: PRODUKT EDITOR ---
    if (view === 'edit_item' && activeItem) return (
        <div className="p-6 space-y-4 animate-in bg-white h-full overflow-y-auto">
            <div className="flex justify-between items-center"><h2 className="text-xl font-black">Bearbeiten</h2><button onClick={()=>setView('order')}><SafeIcon name="X"/></button></div>
            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 space-y-3">
                <div><label className="text-xs font-bold text-slate-400 uppercase">Name</label><input className="w-full bg-white p-3 rounded-xl border font-bold" value={activeItem.name} onChange={e=>setActiveItem({...activeItem, name:e.target.value})} /></div>
                <div className="flex gap-2">
                    <div className="flex-1"><label className="text-xs font-bold text-slate-400 uppercase">SKU</label><input className="w-full bg-white p-3 rounded-xl border" value={activeItem.sku} onChange={e=>setActiveItem({...activeItem, sku:e.target.value})} /></div>
                    <div className="w-24"><label className="text-xs font-bold text-slate-400 uppercase">Einheit</label><input className="w-full bg-white p-3 rounded-xl border" value={activeItem.unit} onChange={e=>setActiveItem({...activeItem, unit:e.target.value})} /></div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Kategorie (Neu tippen zum Erstellen)</label>
                    <input list="cat-suggestions" className="w-full bg-white p-3 rounded-xl border font-bold text-indigo-600" value={activeItem.cat} onChange={e=>setActiveItem({...activeItem, cat:e.target.value})} placeholder="Kategorie..." />
                    <datalist id="cat-suggestions">{selectedSup.categories?.map(c => <option key={c} value={c} />)}</datalist>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {weekdays.map(d => (
                    <div key={d} className={`flex items-center justify-between p-2 rounded-xl border ${d === today ? 'bg-indigo-50 border-indigo-200' : 'bg-white'}`}>
                        <span className="font-bold text-xs w-6">{d}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={()=>setActiveItem({...activeItem, targets:{...activeItem.targets, [d]:Math.max(0, (parseFloat(activeItem.targets?.[d])||0)-1)}})} className="w-6 h-6 bg-slate-100 rounded-lg">-</button>
                            <input type="number" className="w-8 text-center text-sm font-bold bg-transparent outline-none" value={activeItem.targets?.[d]||0} onChange={e=>setActiveItem({...activeItem, targets:{...activeItem.targets, [d]:e.target.value}})} />
                            <button onClick={()=>setActiveItem({...activeItem, targets:{...activeItem.targets, [d]:(parseFloat(activeItem.targets?.[d])||0)+1}})} className="w-6 h-6 bg-slate-100 rounded-lg">+</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 pt-4">
                <button onClick={async ()=>{if(confirm("Löschen?")){
                    const newCatalog = selectedSup.catalog.filter(i=>i.sku !== activeItem.sku);
                    const newCats = [...new Set(newCatalog.map(i => i.cat))];
                    await syncSup(selectedSup.id, {catalog: newCatalog, categories: newCats});
                    setSelectedSup({...selectedSup, catalog: newCatalog, categories: newCats});
                    setView('order');
                }}} className="bg-red-50 text-red-500 p-4 rounded-2xl flex-1 flex justify-center"><SafeIcon name="Trash2"/></button>
                <button onClick={async ()=>{
                    const newCatalog = selectedSup.catalog.map(i=>i.sku === activeItem.sku ? activeItem : i);
                    const newCats = [...new Set(newCatalog.map(i => i.cat))]; // Neue Kategorie automatisch erfassen
                    await syncSup(selectedSup.id, {catalog: newCatalog, categories: newCats});
                    setSelectedSup({...selectedSup, catalog: newCatalog, categories: newCats});
                    setView('order');
                }} className="bg-slate-900 text-white p-4 rounded-2xl flex-[3] font-black flex justify-center gap-2"><SafeIcon name="Save"/> SPEICHERN</button>
            </div>
        </div>
    );

    // --- VIEW: BESTELLUNG ---
    if (view === 'order' && selectedSup) return (
        <div className="min-h-screen bg-slate-50 pb-48">
            <div className="bg-white p-5 sticky top-0 z-50 border-b flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <span className="font-black text-xl italic">{selectedSup.name}</span>
                    <div className="flex gap-2">
                        {isEditMode && <button onClick={handleAddProduct} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1"><SafeIcon name="Plus" size={14}/> Produkt</button>}
                        <button onClick={()=>setIsEditMode(!isEditMode)} className={`p-2 rounded-xl transition-all ${isEditMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}><SafeIcon name="PenTool" size={20}/></button>
                        <button onClick={() => setView('dashboard')} className="p-2 bg-slate-100 rounded-full"><SafeIcon name="X" size={20}/></button>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {selectedSup.categories?.map(cat => (
                        <button key={cat} onClick={() => document.getElementById(`cat-${cat}`)?.scrollIntoView({behavior:'smooth', block:'center'})} 
                                className="whitespace-nowrap px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-200">{cat}</button>
                    ))}
                </div>
            </div>
            <div className="p-4 space-y-8">
                {selectedSup.categories?.map(cat => {
                    const items = selectedSup.catalog.filter(i => i.cat === cat && (isEditMode || parseFloat(i.targets?.[today]) > 0));
                    if (items.length === 0) return null;
                    return (
                        <div key={cat} id={`cat-${cat}`} className="space-y-3">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 border-b border-slate-200 pb-1">{cat}</h3>
                            {items.map(item => (
                                <div key={item.sku} className={`bg-white p-4 rounded-[2rem] border flex items-center justify-between shadow-sm transition-all ${isEditMode ? 'border-dashed border-indigo-300 bg-indigo-50/20' : 'border-slate-100'}`}>
                                    <div onClick={()=>{if(isEditMode){setActiveItem(item); setView('edit_item');}}} className="flex-1 cursor-pointer pr-2">
                                        <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{item.unit}</span>
                                            <span className="text-[10px] font-black uppercase text-indigo-500">Soll: {item.targets?.[today]||0}</span>
                                        </div>
                                    </div>
                                    {!isEditMode && (
                                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                            <button onClick={()=>setCart({...cart, [item.sku]:Math.max(0,(cart[item.sku]||0)-1)})} className="w-10 h-10 bg-white rounded-xl font-bold shadow-sm">-</button>
                                            <span className="w-6 text-center font-bold text-sm">{cart[item.sku]||0}</span>
                                            <button onClick={()=>setCart({...cart, [item.sku]:(cart[item.sku]||0)+1})} className="w-10 h-10 bg-white rounded-xl font-bold shadow-sm">+</button>
                                        </div>
                                    )}
                                    {isEditMode && <SafeIcon name="ChevronRight" size={16} className="text-indigo-400"/>}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
            {!isEditMode && Object.values(cart).some(v=>v>0) && (
                <div className="fixed bottom-24 left-4 right-4 flex gap-2 animate-in-up z-[100]">
                    <div className="flex-1 bg-white border-2 border-slate-900 p-4 rounded-[2rem] flex items-center justify-center gap-2 shadow-2xl">
                        <SafeIcon name="ShoppingBag" size={18} />
                        <span className="font-black text-sm">{Object.values(cart).reduce((a, b) => a + b, 0)} Art.</span>
                    </div>
                    <button onClick={finalizeOrder} className="flex-[2] bg-slate-900 text-white p-4 rounded-[2rem] font-black shadow-2xl uppercase text-sm flex items-center justify-center gap-2">
                        Abschicken <SafeIcon name="ChevronRight" />
                    </button>
                </div>
            )}
        </div>
    );

    // --- VIEW: DASHBOARD ---
    return (
        <div className="p-4 space-y-6 pb-32">
            <div className="flex justify-between items-end pt-6 px-2">
                <h1 className="text-3xl font-black italic tracking-tighter">ALFRED-BESTELLASSISTENT</h1>
                <div className="flex gap-2">
                    <button onClick={()=>setView('checks')} className="bg-white text-slate-900 border border-slate-200 p-3 rounded-2xl shadow-lg relative">
                        <SafeIcon name="ClipboardList" size={24}/>
                    </button>
                    <label className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg cursor-pointer flex items-center"><SafeIcon name="Database" size={24}/><input type="file" className="hidden" onChange={handleSmartImport}/></label>
                    <button onClick={()=>{setEditSup({name:'', email:'', customerNumber:'', catalog:[], categories:[]}); setView('setup')}} className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg"><SafeIcon name="Plus" size={24}/></button>
                </div>
            </div>
            <div className="grid gap-4">
                {suppliers.map(s => {
                    const activeDays = weekdays.filter(d => s.catalog?.some(i => parseFloat(i.targets?.[d]) > 0));
                    const isTodayActive = activeDays.includes(today);
                    
                    // Prüfen ob heute schon bestellt wurde (Datum Vergleich)
                    const lastOrderDate = s.lastOrderedAt?.toDate ? s.lastOrderedAt.toDate().toDateString() : null;
                    const alreadyOrderedToday = lastOrderDate === new Date().toDateString();

                    return (
                        <div key={s.id} className={`bg-white p-6 rounded-[2.5rem] border flex flex-col gap-4 shadow-sm transition-all ${isTodayActive && !alreadyOrderedToday ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100'}`}>
                            <div className="flex justify-between items-center">
                                <div onClick={()=>{setSelectedSup(s); setView('order'); setIsEditMode(false);}} className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div className="font-black text-2xl text-slate-800">{s.name}</div>
                                        {isTodayActive && !alreadyOrderedToday && <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-full animate-pulse">HEUTE</span>}
                                        {alreadyOrderedToday && <span className="bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1"><SafeIcon name="Check" size={10}/> BEREITS BESTELLT</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{s.catalog?.length || 0} Produkte</div>
                                </div>
                                <button onClick={()=>{setEditSup(s); setView('setup')}} className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:bg-slate-900 hover:text-white"><SafeIcon name="Settings" size={20}/></button>
                            </div>
                            <div className="flex gap-1">
                                {weekdays.map(d => (
                                    <div key={d} className={`text-[9px] font-black px-2 py-1 rounded-md ${activeDays.includes(d) ? (d === today ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white') : 'bg-slate-100 text-slate-300'}`}>
                                        {d}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {view === 'setup' && editSup && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center"><h2 className="font-black italic uppercase">Lieferanten-Setup</h2><button onClick={()=>setView('dashboard')}><SafeIcon name="X"/></button></div>
                        <Input label="Name" value={editSup.name} onChange={e=>setEditSup({...editSup, name:e.target.value})} placeholder="Name des Lieferanten" />
                        <Input label="Email" value={editSup.email} onChange={e=>setEditSup({...editSup, email:e.target.value})} placeholder="Email-Adresse (Lieferant)" />
                        <Input label="Kunden-ID" value={editSup.customerNumber} onChange={e=>setEditSup({...editSup, customerNumber:e.target.value})} placeholder="Kundennummer" />
                        {editSup.id && (
                            <button onClick={()=>exportToExcel(editSup)} className="w-full bg-indigo-50 text-indigo-600 p-3 rounded-xl font-bold uppercase text-xs border border-indigo-100 flex justify-center items-center gap-2">
                                <SafeIcon name="FileSpreadsheet" size={16}/> Als Excel Exportieren
                            </button>
                        )}
                        <div className="flex gap-2 pt-4">
                            <button onClick={async ()=>{if(confirm("Löschen?")){await deleteDoc(doc(db,'artifacts',appId,'public','data','suppliers',editSup.id)); setView('dashboard');}}} className="bg-red-50 text-red-500 p-4 rounded-2xl flex-1 flex justify-center"><SafeIcon name="Trash2"/></button>
                            <button onClick={async ()=>{if(editSup.id) await syncSup(editSup.id, editSup); else await addDoc(collection(db,'artifacts',appId,'public','data','suppliers'), {...editSup, updatedAt:serverTimestamp()}); setView('dashboard');}} className="bg-slate-900 text-white p-4 rounded-2xl font-black flex-[3] shadow-lg uppercase text-xs">Speichern</button>
                        </div>
                    </div>
                </div>
            )}
            <p className="text p-1 font-black italic tracking-tighter">v.2.0.6</p>
        </div>
    );
};
