import { createBrowserRouter, Navigate } from "react-router-dom";
import { Home } from "@/features/home/Home";
import { Wizard } from "@/features/wizard/Wizard";
import { Step1Alternatives } from "@/features/wizard/steps/Step1Alternatives";
import { Step2Criteria } from "@/features/wizard/steps/Step2Criteria";
import { Step3Weights } from "@/features/wizard/steps/Step3Weights";
import { Step4Result } from "@/features/wizard/steps/Step4Result";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  {
    path: "/wizard",
    element: <Wizard />,
    children: [
      { index: true, element: <Navigate to="1" replace /> },
      { path: "1", element: <Step1Alternatives /> },
      { path: "2", element: <Step2Criteria /> },
      { path: "3", element: <Step3Weights /> },
      { path: "4", element: <Step4Result /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
