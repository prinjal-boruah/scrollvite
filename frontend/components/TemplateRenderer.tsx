"use client";

import RoyalWeddingTemplate from "./templates/RoyalWeddingTemplate";

interface TemplateRendererProps {
  templateComponent: string;
  schema: any;
}

/**
 * Template Renderer - Routes to the correct template component
 * Add new templates here as you create them
 */
export default function TemplateRenderer({ 
  templateComponent, 
  schema 
}: TemplateRendererProps) {
  
  // Route to correct template component
  switch (templateComponent) {
    case "RoyalWeddingTemplate":
      return <RoyalWeddingTemplate schema={schema} />;
    
    // Add more templates here as you create them:
    // case "MinimalistTemplate":
    //   return <MinimalistTemplate schema={schema} />;
    // case "FloralTemplate":
    //   return <FloralTemplate schema={schema} />;
    
    default:
      // Fallback to Royal Wedding if unknown
      console.warn(`Unknown template component: ${templateComponent}`);
      return <RoyalWeddingTemplate schema={schema} />;
  }
}