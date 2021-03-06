import BasicElementView from '../modules/subViews/basicElementView';
import BoundView from '../modules/subViews/boundView';
import HandlerView from '../modules/subViews/handlerView';
import ConnectorView from '../modules/subViews/connectorView';
import ProgressBarView from '../modules/subViews/progressBarView';
import ResultView from '../modules/subViews/resultView';
import TooltipView from '../modules/subViews/tooltipView';
import InputView from '../modules/subViews/inputView';
import BaseView from '../modules/subViews/baseView';
import MarkView from '../modules/subViews/markView';

interface AdditionalClasses {
  $parent?: string;
  wrapper?: string;
  input?: string;
  bounds?: string;
  base?: string;
  baseWrapper?: string;
  handlers?: string;
  tooltips?: string;
  progressBar?: string;
  connectors?: string;
  result?: string;
}

interface HandlersStateClasses {
  active?: string;
  focus?: string;
}

interface Settings {
  min?: number;
  max?: number;
  step?: number;
  isEnabled?: boolean;
  values?: Values;
  marksCount?: number;
  isMarkClickable?: boolean;
  showMarkValue?: boolean;
  handlersColors?: Array<string>;
  connectorsColors?: Array<string>;
  showResult?: boolean;
  showTooltip?: boolean;
  showBounds?: boolean;
  showInput?: boolean;
  showProgressBar?: boolean;
  showRange?: boolean;
  showMarks?: boolean;
  sortValues?: boolean;
  sortOnlyPares?: boolean;
  sortReversed?: boolean;
  isBaseClickable?: boolean;
  isReversed?: boolean;
  isTooltipReversed?: boolean;
  isMarkValueReversed?: boolean;
  isVertical?: boolean;
  decimalPlaces?: number;
  resultTemplate?: string;
  additionalClasses?: AdditionalClasses;
  handlersStateClasses?: HandlersStateClasses;
  debug?: boolean;
}

type Values = number[];

interface Elements {
  $parent?: BasicElementView;
  input?: InputView;
  wrapper?: BasicElementView;
  baseWrapper?: BasicElementView;
  bounds?: Array<BoundView>;
  base?: BaseView;
  marksWrapper?: BasicElementView;
  marks?: Array<MarkView>;
  handlers?: Array<HandlerView>;
  tooltips?: Array<TooltipView>;
  progressBar?: ProgressBarView;
  connectors?: Array<ConnectorView>;
  result?: ResultView;
}
export { AdditionalClasses, HandlersStateClasses, Settings, Values, Elements };
