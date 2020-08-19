import BasicElementView from './basicElementView';
import BaseView from './baseView';
import ConnectorView from './connectorView';
import TooltipView from './tooltipView';
import View from '../view';
import $ from 'jquery';
import ProgressBarView from './progressBarView';

class HandlerView extends BasicElementView {
  public static elementBase = $('<span class="js-slider__handler"></span>');

  public activeClass = 'js-slider__handler_active';
  public focusClass = 'js-slider__handler_focus';

  private _active: boolean = false;
  private _focus: boolean = false;

  public index: number;
  public percentage: number;
  public value: number;
  public connector: ConnectorView | ProgressBarView;
  public tooltip: TooltipView;

  constructor(
    view: View,
    index: number = 0,
    percentage: number = 0,
    value: number = 0,
    base: BaseView,
    initCallback: Function = HandlerView.init
  ) {
    super(view, HandlerView.elementBase.clone(), base.element, initCallback);
    this.index = index;
    this.percentage = percentage;
    this.value = value;

    if (view.settings.handlersColors[index]) {
      this.css('background-color', view.settings.handlersColors[index]);
    }
    if (view.settings.handlersStateClasses.active) {
      this.activeClass += ` ${view.settings.handlersStateClasses.active}`;
    }
    if (view.settings.handlersStateClasses.focus) {
      this.focusClass += ` ${view.settings.handlersStateClasses.focus}`;
    }

    this.update();
  }

  public static init(that: HandlerView) {
    super.basicInit(that);

    const coordsAxis = that.settings.vertical ? 'clientY' : 'clientX';

    that.element.on('mousedown', function (e) {
      e.preventDefault();
      if (e.which == 1) {
        that._view.trigger('handlerStart', that);
        $(window).on('mousemove', function (e2) {
          that._view.trigger('handlerMoved', that, e2[coordsAxis]);
        });
        $(window).on('mouseup', function (e2) {
          if (e2.which == 1) {
            $(this).off('mousemove mouseup');
            that._view.trigger('handlerEnd', that);
          }
        });
      }
    });

    that.element.on('touchstart', function (e) {
      e.preventDefault();
      that._view.trigger('handlerStart', that);
      $(window).on('touchmove', function (e2) {
        that._view.trigger('handlerMoved', that, e2.touches[0][coordsAxis]);
      });
      $(window).on('touchend', function (e2) {
        $(this).off('touchmove touchend');
        that._view.trigger('handlerEnd', that);
      });
    });
  }

  public update(
    percentage: number | undefined = undefined,
    value: number | undefined = undefined
  ): HandlerView {
    if (typeof percentage === 'number') this.percentage = percentage;
    if (typeof value === 'number') this.value = value;

    if (this.settings.vertical) {
      this.element.css('top', `calc(${this.percentage}% - 7.5px`);
    } else {
      this.element.css('left', `calc(${this.percentage}% - 7.5px`);
    }

    this._view.trigger('handlerUpdated', this);

    if (this.connector) this.connector.update();
    if (this.tooltip) this.tooltip.update();

    return this;
  }

  set active(newValue: boolean) {
    this._active = newValue;
    if (newValue) {
      this.addClass(this.activeClass);
    } else {
      this.removeClass(this.activeClass);
    }
  }

  set focus(newValue: boolean) {
    this._focus = newValue;
    if (newValue) {
      this.addClass(this.focusClass);
    } else {
      this.removeClass(this.focusClass);
    }
  }

  get active(): boolean {
    return this._active;
  }

  get focus(): boolean {
    return this._focus;
  }
}

export default HandlerView;
