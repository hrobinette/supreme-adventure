import Navbar from "@/components/Navbar";
import UploadForm from "./UploadForm";

export default function UploadPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold text-slate-900">
          Upload sales data
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload a CSV using the Meridian deal schema. We&apos;ll validate the
          columns and take you to the insights dashboard.
        </p>
        <UploadForm />
      </main>
    </div>
  );
}
