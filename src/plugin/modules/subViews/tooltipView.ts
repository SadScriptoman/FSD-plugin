import BasicElementView from './basicElementView';
import HandlerView from './handlerView';
import View from '../view';
import $ from 'jquery';

class TooltipView extends BasicElementView {
  public static elementBase = $('<span class="js-slider__tooltip">undef.</span>');
  public handler: HandlerView;
  public reversedClass = 'js-slider__tooltip_reversed';

  constructor(view: View, handler: HandlerView, initCallback?: Function) {
    super(view, TooltipView.elementBase.clone(), handler.element, initCallback);
    this.handler = handler;

    if (view.settings.tooltipReverse) {
      this.addClass(this.reversedClass);
    }

    this.update();
  }

  get value(): number {
    return this.handler.value;
  }

  public update(): TooltipView {
    this.element.text(this.value);

    this._view.trigger('tooltipUpdated', this);

    return this;
  }
}

export default TooltipView;
