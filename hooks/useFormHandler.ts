"use client";

import { Product } from "@/lib/api";
import { useState } from "react";

export const useFormHandler = (product?: Product) => {
  const [formState, setFormState] = useState({
    stockStatus: product?.stockStatus ?? false,
    freeDelivery: product?.deliveryOptions?.freeDelivery ?? false,
    returnDelivery: product?.deliveryOptions?.returnDelivery ?? false,
    colours: product?.colours ?? [],
    sizes: product?.sizes ?? [],
  });

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onSubmit: (formData: FormData) => Promise<void>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    // State'dan qiymatlarni FormData'ga transfer qilish
    Object.entries(formState).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "string" && item.trim()) {
            formData.append(key, item.trim());
          }
        });
      } else {
        formData.set(key, value.toString());
      }
    });

    // File input handling
    const imageInput = form.querySelector<HTMLInputElement>(
      'input[type="file"][name="images"]'
    );
    if (imageInput?.files) {
      Array.from(imageInput.files).forEach((file) => {
        formData.append("images", file);
      });
    }

    await onSubmit(formData);
  };

  const updateFormState = <K extends keyof typeof formState>(
    key: K,
    value: (typeof formState)[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  return {
    formState,
    updateFormState,
    handleSubmit,
  };
};
