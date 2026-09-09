import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { UploadZone } from "./components/UploadZone";
import { InvoicePreview } from "./components/InvoicePreview";
import { ProcessingState } from "./components/ProcessingState";
import { InvoiceDetails } from "./components/InvoiceDetails";
import { LineItems } from "./components/LineItems";
import { VerificationPanel } from "./components/VerificationPanel";
import { JsonViewer } from "./components/JsonViewer";
import { EmptyResults } from "./components/EmptyResults";
import { ErrorState } from "./components/ErrorState";
import { StartNewInvoiceButton } from "./components/ActionButtons";
import { useInvoiceWorkflow } from "./hooks/useInvoiceWorkflow";

function App() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const workflow = useInvoiceWorkflow();

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasResults = workflow.stage === "results" && workflow.data && workflow.verification;

  return (
    <div id="top" className="min-h-screen bg-[var(--background)]">
      <Header onUploadClick={scrollToWorkspace} />
      <Hero onUpload={scrollToWorkspace} onSample={() => { scrollToWorkspace(); workflow.loadSample(); }} />

      <main
        id="how-it-works"
        ref={workspaceRef}
        className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-24 sm:px-8"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: upload / preview */}
          <section aria-label="Invoice upload and preview" className="space-y-5">
            <AnimatePresence mode="wait">
              {workflow.stage === "error" ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ErrorState
                    message={workflow.errorMessage ?? "Something went wrong."}
                    onRetry={workflow.dismissError}
                    onStartOver={workflow.reset}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <UploadZone
                    file={workflow.file}
                    onSelectFile={workflow.selectFile}
                    onRemove={workflow.removeFile}
                    onChangeFile={workflow.removeFile}
                    onExtract={workflow.runExtraction}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {workflow.file && workflow.stage !== "error" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <InvoicePreview
                    previewUrl={workflow.previewUrl}
                    fileName={workflow.file.name}
                    isPdf={workflow.file.type === "application/pdf"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {workflow.stage === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ProcessingState />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* RIGHT: extraction results */}
          <section aria-label="Extraction results" id="features" className="space-y-5">
            <AnimatePresence mode="wait">
              {hasResults && workflow.data && workflow.verification ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">
                      {workflow.isSample ? "Sample results" : "Extracted information"}
                    </h2>
                    <StartNewInvoiceButton onReset={workflow.reset} />
                  </div>

                  <VerificationPanel verification={workflow.verification} />
                  <InvoiceDetails
                    data={workflow.data}
                    verification={workflow.verification}
                    editedFields={workflow.editedFields}
                    onEdit={workflow.editField}
                  />
                  <LineItems data={workflow.data} />
                  <JsonViewer data={workflow.data} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <EmptyResults />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <footer id="security" className="border-t border-[var(--border)] bg-[var(--surface)] py-10">
        <div className="mx-auto max-w-6xl px-5 text-center text-xs text-[var(--muted)] sm:px-8">
          <p>Secure document processing. API credentials remain server-side.</p>
          <p className="mt-1">© {new Date().getFullYear()} Invoice2JSON.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
