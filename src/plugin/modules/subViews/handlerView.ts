import BasicElementView from './basicElementView';
import ConnectorView from './connectorView';
import TooltipView from './tooltipView';
import View from '../view';
import { Align } from '../model';

class HandlerView extends BasicElementView {
  public static elementBase = $('<span class="js-slider__handler"></span>');
  public index: number;
  public percentage: number;
  public connector: ConnectorView | undefined = undefined;
  public tooltip: TooltipView | undefined = undefined;

  constructor(
    view: View,
    index: number = 0,
    percentage: number = 0,
    base: BasicElementView,
    initCallback: Function = HandlerView.init
  ) {
    super(view, HandlerView.elementBase.clone(), base.element, initCallback);
    this.index = index;
    this.percentage = percentage;
    this.update();
  }

  public static init(that: HandlerView) {
    super.basicInit(that);

    const coordsAxis = that.settings.align === Align.vertical ? 'clientY' : 'clientX';

    that.element.on('mousedown', function(e) {
      e.preventDefault();
      that.trigger('handlerStart', e);
      if (e.which == 1) {
        $(window).on('mousemove', function(e2) {
          that.trigger('handlerMoved', e2[coordsAxis]);
        });
        $(window).on('mouseup', function(e2) {
          if (e2.which == 1) {
            $(this).off('mousemove mouseup');
            that.trigger('handlerEnd', e2[coordsAxis]);
          }
        });
      }
    });

    that.element.on('touchstart', function(e) {
      e.preventDefault();
      $(this).trigger('handlerStart', e);
      $(window).on('touchmove', function(e2) {
        that.trigger('handlerMoved', e2.touches[0][coordsAxis]);
      });
      $(window).on('touchend', function(e2) {
        $(this).off('touchmove touchend');
        that.trigger('handlerEnd', e2.touches[0][coordsAxis]);
      });
    });
  }

  public update(percentage: number | undefined = undefined): HandlerView {
    if (typeof percentage === 'number') this.percentage = percentage;

    if (this.settings.align === Align.vertical) {
      this.element.css('top', `calc(${this.percentage}% - 7.5px`);
    } else {
      this.element.css('left', `calc(${this.percentage}% - 7.5px`);
    }

    this.trigger('handlerUpdated');

    if (this.connector) this.connector.update();
    if (this.tooltip) this.tooltip.update();

    return this;
  }
}

export default HandlerView;
