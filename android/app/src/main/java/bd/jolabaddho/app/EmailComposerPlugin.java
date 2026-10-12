package bd.jolabaddho.app;

import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import android.util.Patterns;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "EmailComposer")
public class EmailComposerPlugin extends Plugin {
    @PluginMethod
    public void open(PluginCall call) {
        String to = call.getString("to", "");
        if (!Patterns.EMAIL_ADDRESS.matcher(to).matches() || to.contains("\n") || to.contains("\r")) {
            call.reject("Enter one valid recipient email address."); return;
        }
        String subject = call.getString("subject", "");
        String body = call.getString("body", "");
        Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:" + Uri.encode(to) + "?subject=" + Uri.encode(subject) + "&body=" + Uri.encode(body)));
        try {
            if (intent.resolveActivity(getContext().getPackageManager()) == null) {
                call.reject("No email app is installed. Use Copy or Share instead."); return;
            }
            getActivity().startActivity(intent);
            call.resolve(); // Draft opened, NOT sent or delivered.
        } catch (ActivityNotFoundException e) {
            call.reject("No email app is available. Use Copy or Share instead.");
        }
    }
}
