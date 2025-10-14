"use client";

import React, { useRef, useState, useEffect } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

const ProfilePhotoSelector = ({ setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Effet pour nettoyer l'URL d'aperçu
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const chooseFile = () => {
    inputRef.current?.click();
  };

  return (
    <div className="text-center space-y-2">
      {/* Zone de sélection */}
      <div
        onClick={chooseFile}
        className="w-24 h-24 mx-auto border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
        role="button"
        aria-label="Sélectionner une photo de profil"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Aperçu de la photo de profil"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <LuUser size={40} className="text-gray-400" />
        )}
      </div>

      {/* Champ caché */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Actions */}
      <div className="flex justify-center">
        {previewUrl ? (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="flex items-center text-sm text-red-500 hover:text-red-600 transition-colors duration-200"
            aria-label="Supprimer la photo"
          >
            <LuTrash className="mr-1" /> Supprimer
          </button>
        ) : (
          <button
            type="button"
            onClick={chooseFile}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
            aria-label="Télécharger une photo"
          >
            <LuUpload className="mr-1" /> Télécharger
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoSelector;