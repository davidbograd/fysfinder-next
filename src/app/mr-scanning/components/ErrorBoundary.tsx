"use client";

import { Component, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public reset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">
              Beklager, der opstod en fejl
            </h2>
            <p className="text-gray-600">
              Der opstod en uventet fejl under oversættelsen af din MR-scanning
              rapport.
            </p>
            <Button onClick={this.reset} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Prøv igen
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
