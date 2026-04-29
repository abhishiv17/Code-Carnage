'use client';
import React from 'react';
export class ErrorBoundary extends React.Component<any, any> { constructor(props: any) { super(props); this.state = { hasError: false }; } static getDerivedStateFromError() { return { hasError: true }; } render() { if (this.state.hasError) return <h1>Something went wrong.</h1>; return this.props.children; } }
