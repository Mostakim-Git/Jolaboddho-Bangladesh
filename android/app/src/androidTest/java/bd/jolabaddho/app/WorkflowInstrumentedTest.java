package bd.jolabaddho.app;

import static org.junit.Assert.*;
import android.content.Context;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class WorkflowInstrumentedTest {
    private String js(ActivityScenario<MainActivity> scenario, String script) throws Exception {
        AtomicReference<String> value = new AtomicReference<>("");
        CountDownLatch latch = new CountDownLatch(1);
        scenario.onActivity(activity -> activity.getBridge().getWebView().evaluateJavascript(script, result -> { value.set(result); latch.countDown(); }));
        assertTrue("WebView evaluation timed out", latch.await(10, TimeUnit.SECONDS));
        return value.get();
    }
    private void waitFor(ActivityScenario<MainActivity> scenario, String condition) throws Exception {
        long until = System.currentTimeMillis() + 20000;
        do { if ("true".equals(js(scenario, condition))) return; Thread.sleep(150); } while (System.currentTimeMillis() < until);
        fail("WebView condition failed: " + condition + "; URL=" + js(scenario,"location.href") + "; visible screen=" + js(scenario,"document.body.innerText.slice(0,1800)"));
    }
    private void click(ActivityScenario<MainActivity> scenario, String text) throws Exception {
        String selector = "[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='" + text + "' && !b.disabled && b.offsetParent!==null)";
        waitFor(scenario, "!!(" + selector + ")");
        assertEquals("Button click failed: " + text, "true", js(scenario, "(()=>{const b=" + selector + ";if(!b)return false;b.click();return true;})()"));
    }
    private void clickScreen(ActivityScenario<MainActivity> scenario, String name) throws Exception {
        String selector = "[...document.querySelectorAll('nav[aria-label=\"Report screens\"] button')].find(b=>b.getAttribute('aria-label')==='" + name + "')";
        waitFor(scenario, "!!(" + selector + ")");
        assertEquals("Screen navigation failed: " + name, "true", js(scenario, "(()=>{const b=" + selector + ";if(!b)return false;b.click();return true;})()"));
    }
    // The shipped app has no demo or sample-report path. This test proves the
    // real screens render, navigation works, and no demo affordance exists.
    @Test public void bundledAppOpensNavigatesAndOffersNoDemo() throws Exception {
        Context app = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("bd.jolabaddho.app", app.getPackageName());
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            waitFor(scenario, "!!document.querySelector('.hero h1')");
            assertEquals("true", js(scenario, "document.querySelector('.brand-mark img').src.endsWith('/logo.svg')"));
            assertEquals("true", js(scenario, "window.Capacitor.isNativePlatform()"));
            // No demo button, sample report, or template wording anywhere in the shell.
            assertEquals("0", js(scenario, "[...document.querySelectorAll('button')].filter(b=>/demo|sample report/i.test(b.textContent)).length"));
            assertEquals("0", js(scenario, "document.body.innerText.toLowerCase().includes('exploring a demo')?1:0"));

            click(scenario, "Report a problem");
            waitFor(scenario, "!!document.querySelector('.upload-zone')");
            assertEquals("0", js(scenario, "document.querySelectorAll('.rain-chart > div').length"));

            clickScreen(scenario, "Location");
            waitFor(scenario, "!!document.querySelector('.location-card')");
            // A citizen must pin a real location; there is no sample location.
            waitFor(scenario, "!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Use my location')");
            assertEquals("0", js(scenario, "[...document.querySelectorAll('button')].filter(b=>/demo location/i.test(b.textContent)).length"));

            clickScreen(scenario, "Result");
            waitFor(scenario, "!!document.querySelector('.rain-chart')");
            // Without a loaded forecast the chart must stay empty, not show bars.
            assertEquals("0", js(scenario, "document.querySelectorAll('.rain-chart > div').length"));
            assertEquals("true", js(scenario, "document.querySelector('.rain-number').textContent.includes('—')"));

            clickScreen(scenario, "Complaint");
            waitFor(scenario, "!!document.querySelector('#complaint-text') || !![...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Draft my complaint')");
            // Drafting stays locked until a real assessment and forecast exist.
            assertEquals("true", js(scenario, "[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Draft my complaint').disabled"));
        }
    }
}
