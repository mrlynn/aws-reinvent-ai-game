import React from 'react';

export const AlertDialog = ({ children, open, onOpenChange }) => (
  open ? <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">{children}</div> : null
);

export const AlertDialogContent = ({ children }) => (
  <div className="bg-white p-6 rounded-lg max-w-sm w-full">{children}</div>
);

export const AlertDialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const AlertDialogFooter = ({ children }) => (
  <div className="mt-4 flex justify-end">{children}</div>
);

export const AlertDialogTitle = ({ children }) => (
  <h3 className="text-lg font-medium">{children}</h3>
);

export const AlertDialogDescription = ({ children }) => (
  <p className="text-sm text-gray-500">{children}</p>
);

export const AlertDialogAction = ({ children, ...props }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" {...props}>{children}</button>
);

export const AlertDialogTrigger = ({ children }) => (
  <>{children}</>
);