import React, { useState, useMemo } from "react";
import { Card, Button } from "antd";
import MetadataViewer from "./MetadataViewer";

const PaginatedJsonViewer = ({ rawContent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // useMemo garante que o parse pesado ocorra apenas na primeira renderização
  const parsedData = useMemo(() => {
    try {
      if (!rawContent) return null;

      const parsed =
        typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;

      if (parsed && parsed.content && typeof parsed.content === "string") {
        return JSON.parse(parsed.content);
      }
      return parsed;
    } catch (error) {
      console.error("Erro de Parse no JSON:", error);
      return null;
    }
  }, [rawContent]);

  if (!parsedData) {
    return (
      <Card
        style={{
          marginTop: "16px",
          padding: "16px",
          color: "#d32f2f",
          backgroundColor: "#ffebee",
        }}
      >
        <strong>Erro:</strong> Não foi possível processar os metadados. O
        arquivo pode estar corrompido ou incompleto.
      </Card>
    );
  }

  // Verifica se é um array de árvores para paginar, caso contrário, renderiza o objeto único
  const isArray = Array.isArray(parsedData);
  const dataToRender = isArray ? parsedData[currentIndex] : parsedData;
  const totalItems = isArray ? parsedData.length : 1;

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(totalItems - 1, prev + 1));

  return (
    <Card style={{ marginTop: "16px", padding: "16px" }}>
      {isArray && totalItems >= 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingBottom: "16px",
            borderBottom: "1px solid #eee",
          }}
        >
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{
              padding: "6px 12px",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            }}
          >
            Back
          </Button>

          <span style={{ fontWeight: "bold" }}>
            Tree {currentIndex + 1} of {totalItems}
          </span>

          <Button
            onClick={handleNext}
            disabled={currentIndex === totalItems - 1}
            style={{
              padding: "6px 12px",
              cursor:
                currentIndex === totalItems - 1 ? "not-allowed" : "pointer",
            }}
          >
            Next
          </Button>
        </div>
      )}

      <div style={{ overflowX: "auto", maxHeight: "60vh" }}>
        <MetadataViewer data={dataToRender} />
      </div>
    </Card>
  );
};

export default PaginatedJsonViewer;
