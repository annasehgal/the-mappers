"""Isolated compatibility shim for the pre-existing Playwright/pyee mismatch."""
try:
    import pyee
    from pyee.asyncio import AsyncIOEventEmitter
    pyee.AsyncIOEventEmitter = AsyncIOEventEmitter
except ImportError:
    pass
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True,channel="chrome")
    page = browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True,device_scale_factor=2)
    errors=[]
    page.on("pageerror",lambda e: (errors.append(str(e)),print("PAGE ERROR:",e,flush=True)))
    page.on("requestfailed",lambda r: print("REQUEST FAILED:",r.url,r.failure,flush=True))
    page.add_init_script("""window.announcements=[];if(window.speechSynthesis){const original=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{window.announcements.push(u.text);original(u);};}""")
    page.goto("http://127.0.0.1:8001/?building=holt&floor=1&location=holt-f1-entry-125")
    page.wait_for_selector('body[data-ready="true"]',timeout=45000)
    assert page.locator("#start").input_value()=="entry"
    assert "QR start" in page.locator("#entry-note").text_content()
    page.locator("#search").fill("HOLT 102")
    page.locator("#results button").click()
    assert page.locator("#go").is_enabled()
    assert "351 plan units" in page.locator("#metrics").text_content()
    page.screenshot(path="/tmp/holt-preview.png")
    page.locator("#mode").click()
    page.screenshot(path="/tmp/holt-3d.png")
    # Real touch events exercise OrbitControls rotation and two-finger zoom.
    cdp=page.context.new_cdp_session(page)
    before=page.locator("#map").screenshot()
    def touch(kind,points):
        cdp.send("Input.dispatchTouchEvent",{"type":kind,"touchPoints":[{"x":x,"y":y,"id":i} for i,(x,y) in enumerate(points)]})
    touch("touchStart",[(140,280)])
    touch("touchMove",[(190,310)])
    touch("touchEnd",[])
    touch("touchStart",[(130,290),(210,290)])
    touch("touchMove",[(100,290),(240,290)])
    touch("touchEnd",[])
    after=page.locator("#map").screenshot()
    assert before!=after
    assert page.locator("#title").text_content()=="HOLT 102"
    page.locator("#mode").click()
    page.locator("#go").click()
    assert page.locator("#start").is_disabled()
    assert page.evaluate("window.announcements.length")==1
    page.locator("#audio").click()
    assert page.locator("#audio").text_content()=="Audio off"
    for i in range(4):
        page.locator("#go").click()
    assert page.evaluate("window.announcements.length")==1
    assert page.locator("#title").text_content()=="You’ve arrived"
    assert page.locator("#progress").get_attribute("value")=="4"
    page.screenshot(path="/tmp/holt-arrival.png")
    page.locator("#go").click()
    assert page.locator("#search").input_value()==""
    for width,height in [(390,844),(360,740),(430,932)]:
        page.set_viewport_size({"width":width,"height":height})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not errors,errors
    print("PASS: QR entry, Room 102 search/preview, camera toggle, audio mute, four confirmations, arrival/reset, three phone widths; no page errors.")
    browser.close()
