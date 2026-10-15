/* One scene, one action. Native fullscreen with an accessible modal fallback. */
(() => {
    let session=null;
    const card=()=>document.getElementById('rusticAnglerCard');
    function restore() {
        if(!session)return;
        const saved=session;session=null;
        const scene=card();
        delete scene.dataset.fullscreen;
        if(saved.placeholder) {saved.placeholder.replaceWith(scene);saved.dialog.close();saved.dialog.remove();}
        document.getElementById('rusticCanvasContainer').style.display=saved.stageDisplay;
        document.body.style.overflow=saved.overflow;
        document.getElementById('btnToggleAnglerCollapse').setAttribute('aria-expanded',String(saved.stageDisplay!=='none'));
        document.getElementById('btnPondFullscreen').focus({preventScroll:true});
        syncAnglerMotion();
    }
    function fallback() {
        const d=document.createElement('dialog'),placeholder=document.createComment('pond fullscreen return');
        d.className='pond-fullscreen-fallback';d.setAttribute('aria-label','Hồ câu toàn màn hình. Nhấn Escape hoặc chạm đúp mặt hồ để thoát.');
        card().before(placeholder);document.body.append(d);d.append(card());
        session.placeholder=placeholder;session.dialog=d;
        d.addEventListener('cancel',e=>{e.preventDefault();restore();});
        d.showModal();
    }
    window.enterPondFullscreen=async function() {
        if(session)return;
        const scene=card(),stage=document.getElementById('rusticCanvasContainer');
        session={stageDisplay:stage.style.display,overflow:document.body.style.overflow};
        scene.dataset.fullscreen='true';stage.style.display='block';document.body.style.overflow='hidden';
        try {
            if(!scene.requestFullscreen)throw new Error('Fullscreen unavailable');
            await scene.requestFullscreen({navigationUI:'hide'});
        } catch {
            if(!session)return;
            fallback();
        }
        if(!session)return;
        document.getElementById('btnAnglerCastReel').focus({preventScroll:true});
        syncAnglerMotion();
    };
    window.exitPondFullscreen=async function() {
        if(document.fullscreenElement===card())await document.exitFullscreen();
        else restore();
    };
    document.addEventListener('fullscreenchange',()=>{if(session&&!session.dialog&&document.fullscreenElement!==card())restore();});
    document.addEventListener('keydown',e=>{
        if(session&&e.key==='Tab') {e.preventDefault();document.getElementById('btnAnglerCastReel').focus();}
        if(session&&e.key==='Escape') {e.preventDefault();window.exitPondFullscreen();}
    });
    document.getElementById('rusticCanvasContainer').addEventListener('dblclick',()=>{if(session)window.exitPondFullscreen();});
})();
