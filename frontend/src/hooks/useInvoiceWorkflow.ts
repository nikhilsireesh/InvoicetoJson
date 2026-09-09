import { useCallback, useMemo, useState } from "react";
import type {
  EditedFields,
  InvoiceData,
  VerificationResult,
  WorkflowStage,
} from "../types/invoice";
import { extractInvoiceFile, fetchSampleInvoice } from "../utils/api";
import { runVerificationClientSide } from "../utils/verify";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

export function useInvoiceWorkflow() {
  const [stage, setStage] = useState<WorkflowStage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [editedFields, setEditedFields] = useState<EditedFields>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);

  const validateFile = useCallback((candidate: File): string | null => {
    const nameOk = /\.(png|jpe?g|pdf)$/i.test(candidate.name);
    const typeOk = ALLOWED_TYPES.includes(candidate.type) || nameOk;
    if (!typeOk) {
      return "Unsupported file type. Please upload PNG, JPG, JPEG or PDF.";
    }
    if (candidate.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 10 MB.";
    }
    return null;
  }, []);

  const selectFile = useCallback(
    (candidate: File) => {
      const validationError = validateFile(candidate);
      if (validationError) {
        setErrorMessage(validationError);
        setStage("error");
        return;
      }
      setErrorMessage(null);
      setFile(candidate);
      setIsSample(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(candidate.type === "application/pdf" ? null : URL.createObjectURL(candidate));
      setData(null);
      setVerification(null);
      setEditedFields({});
      setStage("preview");
    },
    [previewUrl, validateFile]
  );

  const removeFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setData(null);
    setVerification(null);
    setEditedFields({});
    setErrorMessage(null);
    setIsSample(false);
    setStage("upload");
  }, [previewUrl]);

  const runExtraction = useCallback(async () => {
    if (!file) return;
    setStage("processing");
    setErrorMessage(null);

    const result = await extractInvoiceFile(file);

    if (!result.success) {
      setErrorMessage(result.error);
      setStage("error");
      return;
    }

    setData(result.data);
    setVerification(result.verification);
    setEditedFields({});
    setStage("results");
  }, [file]);

  const loadSample = useCallback(async () => {
    setIsSample(true);
    setFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    setStage("processing");

    const result = await fetchSampleInvoice();
    if (!result.success) {
      setErrorMessage(result.error);
      setStage("error");
      return;
    }
    setData(result.data);
    setVerification(result.verification);
    setEditedFields({});
    setStage("results");
  }, []);

  const editField = useCallback(
    <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev, [field]: value };
        setVerification(runVerificationClientSide(next));
        return next;
      });
      setEditedFields((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStage("upload");
    setFile(null);
    setPreviewUrl(null);
    setData(null);
    setVerification(null);
    setEditedFields({});
    setErrorMessage(null);
    setIsSample(false);
  }, [previewUrl]);

  const dismissError = useCallback(() => {
    setErrorMessage(null);
    setStage(file ? "preview" : "upload");
  }, [file]);

  return useMemo(
    () => ({
      stage,
      file,
      previewUrl,
      data,
      verification,
      editedFields,
      errorMessage,
      isSample,
      selectFile,
      removeFile,
      runExtraction,
      loadSample,
      editField,
      reset,
      dismissError,
    }),
    [
      stage,
      file,
      previewUrl,
      data,
      verification,
      editedFields,
      errorMessage,
      isSample,
      selectFile,
      removeFile,
      runExtraction,
      loadSample,
      editField,
      reset,
      dismissError,
    ]
  );
}
