import BasicElementView from '../modules/subViews/basicElementView';
import BoundView from '../modules/subViews/boundView';
import HandlerView from '../modules/subViews/handlerView';
import ConnectorView from '../modules/subViews/connectorView';
import ResultView from '../modules/subViews/resultView';
import TooltipView from '../modules/subViews/tooltipView';

interface AdditionalClasses {
  wrapper?: string;
  base?: string;
  handlers?: string;
  connectors?: string;
  result?: string;
}

interface Settings {
  min: number;
  max: number;
  range: boolean;
  startValues: Values;
  handlersColors: Array<string>;
  connectorsColors: Array<string>;
  align: number;
  tooltipReverse: boolean;
  showResult: boolean;
  showTooltip: boolean;
  showBounds: boolean;
  additionalClasses: AdditionalClasses;
  step: number;
  sortValues: boolean;
  sortOnlyPares: boolean;
  roundTo: number;
  resultTemplate: string;
}

type Values = number[];

interface Elements {
  parent?: BasicElementView;
  input?: BasicElementView;
  wrapper?: BasicElementView;
  base?: BasicElementView;
  baseWrapper?: BasicElementView;
  handlers?: Array<HandlerView>;
  bounds?: Array<BoundView>;
  tooltips?: Array<TooltipView>;
  connectors?: Array<ConnectorView>;
  result?: ResultView;
}
export { AdditionalClasses, Settings, Values, Elements };
