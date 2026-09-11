package in.bluebuff.games;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Configure WebView for seamless in-app Google authentication
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            configureWebView(webView);
        }

        // Handle hardware back button
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView wv = getBridge() != null ? getBridge().getWebView() : null;
                if (wv != null && wv.canGoBack()) {
                    wv.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            configureWebView(webView);
        }
    }

    private void configureWebView(WebView webView) {
        WebSettings settings = webView.getSettings();
        
        // Remove "wv" and "Version/X.X" so Google OAuth doesn't block WebView with 403 disallowed_useragent
        String userAgent = settings.getUserAgentString();
        if (userAgent != null && (userAgent.contains("; wv") || userAgent.contains("Version/"))) {
            String cleanUserAgent = userAgent
                .replaceAll(";\\s*wv\\)", ")")
                .replaceAll("Version/[0-9.]+\\s*", "");
            settings.setUserAgentString(cleanUserAgent);
        }

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        // Ensure OAuth cookies and session cookies are preserved
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);
    }
}
