

import React, { Suspense } from 'react'; 
import CreateOrEditRecipeForm from './CreateOrEditRecipeForm';



export default function CreateOrEditRecipePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen text-white text-2xl">
        Loading form...
      </div>
    }>
      <CreateOrEditRecipeForm />
    </Suspense>
  );
}
