import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transform",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-blue-800 focus-visible:ring-blue-500",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500",
        outline:
          "border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus-visible:ring-gray-500",
        secondary:
          "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/40 hover:from-gray-700 hover:to-gray-800 focus-visible:ring-gray-500",
        ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md focus-visible:ring-gray-500",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-blue-700 dark:hover:text-blue-300",
        success: "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 hover:from-green-700 hover:to-green-800 focus-visible:ring-green-500",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 hover:from-yellow-600 hover:to-orange-600 focus-visible:ring-yellow-500",
        purple: "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:from-purple-700 hover:to-purple-800 focus-visible:ring-purple-500",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 py-2 text-xs",
        lg: "h-14 rounded-2xl px-10 py-4 text-base",
        xl: "h-16 rounded-2xl px-12 py-5 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-14 w-14 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
