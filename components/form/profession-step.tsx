"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HANDYMAN_PROFESSIONS } from "@/app/lib/professions";

const COMMON_PROFESSIONS = HANDYMAN_PROFESSIONS;

interface ProfessionStepProps {
  professions: string[];
  onAdd: (profession: string) => void;
  onRemove: (profession: string) => void;
  errors?: string[];
}

const ProfessionStep = ({
  professions,
  onAdd,
  onRemove,
  errors
}: ProfessionStepProps) => {
  const [customProfession, setCustomProfession] = useState("");

  const handleAddCustom = () => {
    if (customProfession.trim()) {
      onAdd(customProfession.trim());
      setCustomProfession("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomProfession(e.target.value);
  };

  const handleProfessionToggle = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const profession = event.currentTarget.dataset.profession;

    if (!profession) throw new Error("data-profession attribute is missing");

    professions.includes(profession) ? onRemove(profession) : onAdd(profession);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h3 className="text-sm font-medium font-mono mb-2">
          Select your skills
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_PROFESSIONS.map(profession => (
            <button
              key={profession}
              type="button"
              data-profession={profession}
              onClick={handleProfessionToggle}
              className={`p-2 text-sm rounded-md border transition-colors text-left ${
                professions.includes(profession)
                  ? "bg-blue-50 border-blue-200 text-blue-800"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              {profession}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="custom_profession" className="text-sm font-medium">
          Add custom skill
        </Label>
        <div className="flex space-x-2 mt-2">
          <Input
            id="custom_profession"
            type="text"
            placeholder="e.g., Pool Maintenance"
            value={customProfession}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddCustom}
            disabled={!customProfession.trim()}
            size="sm"
          >
            Add
          </Button>
        </div>
      </div>

      {professions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium font-mono">Selected skills</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {professions.map(profession => (
              <span
                key={profession}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {profession}
                <button
                  type="button"
                  onClick={() => onRemove(profession)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {professions.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Please select at least one skill to continue
        </p>
      )}

      {errors && errors.length > 0 && (
        <div className="text-red-500 text-sm">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessionStep;
