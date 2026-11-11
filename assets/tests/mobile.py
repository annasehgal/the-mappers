"""Mobile regression checks against a running source or static production package."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("--base-url", default="http://127.0.0.1:8002/")
parser.add_argument("--screenshots", default="/tmp/holt-final-ui")
args = parser.parse_args()
base = args.base_url.rstrip("/") + "/"
shots = Path(args.screenshots)
shots.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True)
    errors, failed = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("requestfailed", lambda request: failed.append(request.url))
    page.on("response", lambda response: failed.append(str(response.status)+" "+response.url) if response.status>=400 and not response.url.endswith("favicon.ico") else None)
    page.add_init_script("""window.spoken=[];if(window.speechSynthesis){const original=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{window.spoken.push(u.text);original(u);};}""")

    def ready(url):
        page.goto(url)
        page.wait_for_load_state("networkidle")
        page.wait_for_selector('body[data-ready="true"]')

    def destination(query):
        page.locator("#search").fill(query)
        page.locator("#results button").first.click()
        assert page.locator("#go").is_enabled()

    def layout():
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
        sheet = page.locator("#sheet").bounding_box()
        for selector in ["#mode","#plus","#minus","#recenter","#checkpoints"]:
            box = page.locator(selector).bounding_box()
            assert box and box["y"]+box["height"]<=sheet["y"], (selector,box,sheet)
        canvas = page.locator("#map canvas").bounding_box()
        assert canvas and canvas["height"]>100
        for selector in ["#go","#reset","#start","#pick","#audio","#replay"]:
            if not page.locator(selector).is_visible():
                continue
            box = page.locator(selector).bounding_box()
            assert box["x"]>=0 and box["x"]+box["width"]<=page.viewport_size["width"], (selector,box)

    try:
        # Every QR identifier must select its own start and offer Room 102.
        for entry in "abcd":
            ready(base+"?building=holt&floor=1&location=holt-entry-"+entry)
            assert page.locator("#start").input_value()=="holt-entry-"+entry
            destination("102")

        ready(base+"?building=holt&floor=1&location=holt-entry-c")
        page.locator("#category").select_option("restroom")
        assert page.locator("#results button").count()==4
        page.locator("#category").select_option("")
        destination("102")
        for width,height in [(375,812),(390,844),(393,852),(430,932)]:
            page.set_viewport_size({"width":width,"height":height})
            layout()
            page.screenshot(path=str(shots/f"preview-{width}.png"))
            page.locator("#expand").click()
            page.locator("#accessible").check()
            assert page.locator("#go").is_disabled()
            page.locator("#accessible").uncheck()
            assert page.locator("#go").is_enabled()
            layout()
            page.locator("#expand").click()
        page.set_viewport_size({"width":390,"height":844})
        page.locator("#mode").click()
        assert page.locator("#mode").inner_text()=="2D"
        page.locator("#plus").click()
        page.locator("#minus").click()
        page.locator("#checkpoints").click()
        assert page.locator("#checkpoints").get_attribute("aria-pressed")=="false"
        page.locator("#checkpoints").click()
        page.screenshot(path=str(shots/"isometric.png"))
        # Touch rotation and pinch zoom use the actual browser touch pipeline.
        cdp = page.context.new_cdp_session(page)
        box = page.locator("#map").bounding_box()
        x,y=box["x"]+box["width"]*.4,box["y"]+box["height"]*.45
        def touch(kind,points):
            cdp.send("Input.dispatchTouchEvent",{"type":kind,"touchPoints":[{"id":i,"x":px,"y":py} for i,(px,py) in enumerate(points)]})
        touch("touchStart",[(x,y)])
        touch("touchMove",[(x+30,y+15)])
        touch("touchEnd",[])
        touch("touchStart",[(x-20,y),(x+20,y)])
        touch("touchMove",[(x-40,y),(x+40,y)])
        touch("touchEnd",[])
        page.locator("#mode").click()
        page.locator("#start").select_option("holt-entry-c")
        # A tap at the centered start must ask for explicit confirmation.
        page.locator("#reset").click()
        page.locator("#start").select_option("holt-entry-c")
        page.locator("#pick").click()
        box=page.locator("#map").bounding_box()
        page.locator("#map canvas").tap(position={"x":box["width"]/2,"y":box["height"]/2})
        page.locator("#location-dialog").wait_for(state="visible")
        page.locator("#confirm-start").click()
        assert page.locator("#start").input_value()=="holt-entry-c"
        destination("102")
        page.locator("#go").click()
        page.locator("#pause").click()
        assert page.locator("body").get_attribute("data-phase")=="paused"
        page.locator("#pause").click()
        page.locator("#replay").click()
        assert page.evaluate("window.spoken.length")>=2
        page.locator("#audio").click()
        assert page.locator("#audio").inner_text()=="Audio off"
        page.locator("#recenter").click()
        seen_stairs=False
        for _ in range(140):
            seen_stairs |= "short stairs" in page.locator("#status").inner_text()
            if page.locator("body").get_attribute("data-phase")=="arrived":
                break
            page.locator("#go").click()
        assert seen_stairs
        assert page.locator("#direction").inner_text()=="✓"
        page.screenshot(path=str(shots/"arrival.png"))
        page.locator("#go").click()
        assert page.locator("#search").input_value()==""
        ready(base+"?building=holt&floor=2&location=holt-entry-c")
        assert page.locator("#start").input_value()==""
        page.goto(base+"qr.html")
        page.wait_for_load_state("networkidle")
        for image in page.locator("img").all():
            assert image.evaluate("(image)=>image.complete&&image.naturalWidth>0")
        page.get_by_role("link",name="Open Entry C",exact=True).click()
        page.wait_for_selector('body[data-ready="true"]')
        assert page.locator("#start").input_value()=="holt-entry-c"
        assert not errors, errors
        assert not failed, failed
        print("PASS:",base,"— A/B/C/D QR selection, C→102 including stairs/arrival, all 4 mobile sizes, settings/inputs, search, 2D/3D, touch, audio API, checkpoints, pause/resume, invalid QR, all static resources.")
    finally:
        browser.close()
