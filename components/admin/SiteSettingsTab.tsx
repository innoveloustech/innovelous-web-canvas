"use client";
import React, { useState, useEffect } from "react";
import { useAdminSettings } from "@/lib/hooks/admin/useAdminContent";
import { AdminLoading, adminErrorMessage } from "./AdminFeedback";

export default function SiteSettingsTab() {
  const { data: loadedSettings, isLoading, error, saveSettings, uploadSettingsFile, removeSettingsFile, isSaving } = useAdminSettings();
  const [saved, setSaved] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!loadedSettings) return;
    setEmail(loadedSettings.email ?? "");
    setPhone(loadedSettings.phone ?? "");
    setOfficeLocation(loadedSettings.office_location ?? "");
    setOfficeAddress(loadedSettings.office_address ?? "");
    setFacebookUrl(loadedSettings.facebook_url ?? "");
    setGithubUrl(loadedSettings.github_url ?? "");
    setInstagramUrl(loadedSettings.instagram_url ?? "");
    setWhatsappUrl(loadedSettings.whatsapp_url ?? "");
    setLogoUrl(loadedSettings.logo_url ?? "");
    setFaviconUrl(loadedSettings.favicon_url ?? "");
    setOgImageUrl(loadedSettings.og_image_url ?? "");
  }, [loadedSettings]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    const oldLogo = logoUrl;
    const oldFavicon = faviconUrl;
    const oldOgImage = ogImageUrl;

    try {
      let resolvedLogo = logoUrl;
      let resolvedFavicon = faviconUrl;
      let resolvedOgImage = ogImageUrl;

      if (logoFile) resolvedLogo = await uploadSettingsFile(logoFile, "logo");
      if (faviconFile) resolvedFavicon = await uploadSettingsFile(faviconFile, "favicon");
      if (ogImageFile) resolvedOgImage = await uploadSettingsFile(ogImageFile, "og-image");

      await saveSettings({
        email, phone, office_location: officeLocation, office_address: officeAddress,
        facebook_url: facebookUrl, github_url: githubUrl, instagram_url: instagramUrl,
        whatsapp_url: whatsappUrl, logo_url: resolvedLogo, favicon_url: resolvedFavicon, og_image_url: resolvedOgImage,
      });

      if (logoFile && oldLogo !== resolvedLogo) await removeSettingsFile(oldLogo);
      if (faviconFile && oldFavicon !== resolvedFavicon) await removeSettingsFile(oldFavicon);
      if (ogImageFile && oldOgImage !== resolvedOgImage) await removeSettingsFile(oldOgImage);

      setSaved(true);
      setLogoFile(null);
      setFaviconFile(null);
      setOgImageFile(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      alert(adminErrorMessage(err, "Failed to save settings."));
    }
  };

  if (isLoading) return <AdminLoading label="Loading settings..." />;
  if (error) return <AdminLoading label={adminErrorMessage(error, "Unable to load settings")} />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Site Settings</h1>
        <p className="text-neutral-500 text-sm font-light">
          Manage social links, contact information, logo, and favicon. Changes are saved to the database.
          Use the Publish button on the Dashboard to rebuild the site with these changes.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Social Links */}
        <section className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
          <h2 className="text-white text-sm font-medium mb-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Social Links
          </h2>
          <p className="text-neutral-600 text-xs font-light mb-5">These links appear in the Contact/Footer section.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Facebook URL</label>
                <input type="url" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..."
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">GitHub URL</label>
                <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..."
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Instagram URL</label>
                <input type="url" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..."
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">WhatsApp URL</label>
                <input type="url" value={whatsappUrl} onChange={e => setWhatsappUrl(e.target.value)} placeholder="https://wa.me/..."
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
          <h2 className="text-white text-sm font-medium mb-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Information
          </h2>
          <p className="text-neutral-600 text-xs font-light mb-5">Displayed in the Contact section and footer.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@example.com"
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 890"
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Office Location</label>
                <input type="text" value={officeLocation} onChange={e => setOfficeLocation(e.target.value)} placeholder="Country, City"
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Office Address</label>
                <input type="text" value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} placeholder="Street, Area"
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Brand Assets */}
        <section className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
          <h2 className="text-white text-sm font-medium mb-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Logo & Favicon
          </h2>
          <p className="text-neutral-500 text-[10px] font-mono mb-5">Current values are shown. Only change these if you want to replace them.</p>
          <div className="space-y-6">
            {/* Logo */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-2">Site Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl border border-white/10 overflow-hidden bg-black flex-shrink-0">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="logo preview" className="w-full h-full object-contain" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="current logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">N/A</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="relative border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-white/20 transition-colors">
                    <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {logoFile ? logoFile.name : "Click to replace logo (optional)"}
                    </p>
                  </div>
                  <p className="mt-2 text-[10px] text-neutral-600 font-mono truncate">
                    Current: {logoUrl ? logoUrl.split('/').pop() || logoUrl : 'none'}
                  </p>
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-2">Favicon</label>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden bg-black flex-shrink-0">
                  {faviconFile ? (
                    <img src={URL.createObjectURL(faviconFile)} alt="favicon preview" className="w-full h-full object-contain" />
                  ) : faviconUrl ? (
                    <img src={faviconUrl} alt="current favicon" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[8px]">N/A</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="relative border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-white/20 transition-colors">
                    <input type="file" accept="image/*" onChange={e => setFaviconFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {faviconFile ? faviconFile.name : "Click to replace favicon (optional)"}
                    </p>
                  </div>
                  <p className="mt-2 text-[10px] text-neutral-600 font-mono truncate">
                    Current: {faviconUrl ? faviconUrl.split('/').pop() || faviconUrl : 'none'}
                  </p>
                </div>
              </div>
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-2">Open Graph Image (1200x630)</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-10 rounded-lg border border-white/10 overflow-hidden bg-black flex-shrink-0">
                  {ogImageFile ? (
                    <img src={URL.createObjectURL(ogImageFile)} alt="og preview" className="w-full h-full object-cover" />
                  ) : ogImageUrl ? (
                    <img src={ogImageUrl} alt="current og image" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[8px]">N/A</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="relative border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-white/20 transition-colors">
                    <input type="file" accept="image/*" onChange={e => setOgImageFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {ogImageFile ? ogImageFile.name : "Click to replace OG image (optional)"}
                    </p>
                  </div>
                  <p className="mt-2 text-[10px] text-neutral-600 font-mono truncate">
                    Current: {ogImageUrl ? ogImageUrl.split('/').pop() || ogImageUrl : 'none'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          {saved && (
            <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
