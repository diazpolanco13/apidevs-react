declare module 'react-plotly.js' {
  import { Component } from 'react';
  
  export interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    frames?: any[];
    revision?: number;
    onInitialized?: (figure: any, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: any, graphDiv: HTMLElement) => void;
    onPurge?: (figure: any, graphDiv: HTMLElement) => void;
    onError?: (err: any) => void;
    className?: string;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    onHover?: (event: any) => void;
    onClick?: (event: any) => void;
    onRelayout?: (event: any) => void;
    onSelected?: (event: any) => void;
    onUnhover?: (event: any) => void;
  }

  export default class Plot extends Component<PlotParams> {}
}

