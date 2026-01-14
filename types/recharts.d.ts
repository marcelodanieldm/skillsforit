declare module 'recharts' {
  import { ComponentType, ReactElement, CSSProperties } from 'react';

  export interface PieLabelRenderProps {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
    index?: number;
    name?: string;
    value?: number;
    fill?: string;
    [key: string]: any;
  }

  export interface ChartProps {
    width?: number | string;
    height?: number | string;
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: React.ReactNode;
  }

  export interface ResponsiveContainerProps {
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    aspect?: number;
    children?: React.ReactNode;
    debounce?: number;
    id?: string;
    className?: string;
  }

  export interface LineChartProps extends ChartProps {
    onClick?: (data: any, index: number) => void;
    onMouseEnter?: (data: any, index: number) => void;
    onMouseMove?: (data: any) => void;
    onMouseLeave?: () => void;
    syncId?: string;
    syncMethod?: 'index' | 'value';
  }

  export interface BarChartProps extends ChartProps {
    layout?: 'horizontal' | 'vertical';
    stackOffset?: 'expand' | 'none' | 'wiggle' | 'silhouette' | 'sign';
    barCategoryGap?: number | string;
    barGap?: number | string;
    barSize?: number;
  }

  export interface PieChartProps extends ChartProps {}

  export interface AreaChartProps extends ChartProps {
    stackOffset?: 'expand' | 'none' | 'wiggle' | 'silhouette' | 'sign';
  }

  export interface FunnelChartProps extends ChartProps {
    layout?: 'horizontal' | 'vertical';
  }

  export interface XAxisProps {
    dataKey?: string | number | ((dataObject: any) => any);
    hide?: boolean;
    scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
    type?: 'number' | 'category';
    allowDecimals?: boolean;
    stroke?: string;
    tick?: boolean | ReactElement | ComponentType<any> | object;
    tickFormatter?: (value: any, index: number) => string;
    [key: string]: any;
  }

  export interface YAxisProps extends XAxisProps {}

  export interface CartesianGridProps {
    strokeDasharray?: string | number;
    stroke?: string;
    vertical?: boolean;
    horizontal?: boolean;
    [key: string]: any;
  }

  export interface TooltipProps {
    active?: boolean;
    payload?: any[];
    label?: any;
    separator?: string;
    formatter?: (value: any, name: string, props: any) => any;
    labelFormatter?: (label: any) => any;
    content?: ReactElement | ComponentType<any>;
    cursor?: boolean | object | ReactElement;
    [key: string]: any;
  }

  export interface LegendProps {
    content?: ReactElement | ComponentType<any>;
    wrapperStyle?: CSSProperties;
    iconSize?: number;
    iconType?: 'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    [key: string]: any;
  }

  export interface LineProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string | number | ((dataObject: any) => any);
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    dot?: boolean | object | ReactElement | ComponentType<any>;
    activeDot?: boolean | object | ReactElement | ComponentType<any>;
    [key: string]: any;
  }

  export interface BarProps {
    dataKey: string | number | ((dataObject: any) => any);
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    radius?: number | number[];
    [key: string]: any;
  }

  export interface AreaProps extends LineProps {
    stackId?: string | number;
  }

  export interface PieProps {
    data?: any[];
    dataKey: string | number;
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    fill?: string;
    stroke?: string;
    label?: boolean | ReactElement | ComponentType<any> | ((props: PieLabelRenderProps) => any);
    labelLine?: boolean | object;
    [key: string]: any;
  }

  export interface CellProps {
    fill?: string;
    stroke?: string;
    [key: string]: any;
  }

  export interface FunnelProps {
    dataKey: string | number;
    fill?: string;
    stroke?: string;
    isAnimationActive?: boolean;
    animationDuration?: number;
    [key: string]: any;
  }

  export interface LabelListProps {
    dataKey?: string | number;
    position?: 'top' | 'left' | 'right' | 'bottom' | 'inside' | 'outside' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideTopLeft' | 'insideBottomLeft' | 'insideTopRight' | 'insideBottomRight' | 'insideStart' | 'insideEnd' | 'end' | 'center';
    content?: ReactElement | ComponentType<any>;
    valueAccessor?: (entry: any, index: number) => any;
    formatter?: (value: any) => string;
    [key: string]: any;
  }

  export interface ReferenceLineProps {
    x?: number | string;
    y?: number | string;
    stroke?: string;
    strokeDasharray?: string | number;
    strokeWidth?: number;
    label?: string | number | ReactElement | ComponentType<any>;
    isFront?: boolean;
    [key: string]: any;
  }

  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const LineChart: ComponentType<LineChartProps>;
  export const BarChart: ComponentType<BarChartProps>;
  export const PieChart: ComponentType<PieChartProps>;
  export const AreaChart: ComponentType<AreaChartProps>;
  export const FunnelChart: ComponentType<FunnelChartProps>;
  export const XAxis: ComponentType<XAxisProps>;
  export const YAxis: ComponentType<YAxisProps>;
  export const CartesianGrid: ComponentType<CartesianGridProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const Legend: ComponentType<LegendProps>;
  export const Line: ComponentType<LineProps>;
  export const Bar: ComponentType<BarProps>;
  export const Area: ComponentType<AreaProps>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<CellProps>;
  export const Funnel: ComponentType<FunnelProps>;
  export const LabelList: ComponentType<LabelListProps>;
  export const ReferenceLine: ComponentType<ReferenceLineProps>;
}
