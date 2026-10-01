"use client";

import React from "react";

interface ErrorBoundaryProps { children: React.ReactNode }
interface ErrorBoundaryState { hasError: boolean }

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">This widget could not be rendered. Check the backend response and try again.</div>;
    }
    return this.props.children;
  }
}