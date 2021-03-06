import $ from 'jquery';

import * as slider from '../types/slider';
import Presenter from './presenter';
import BasicElementView from './subViews/basicElementView';
import BaseView from './subViews/baseView';
import MarkView from './subViews/markView';
import BoundView from './subViews/boundView';
import HandlerView from './subViews/handlerView';
import ConnectorView from './subViews/connectorView';
import ProgressBarView from './subViews/progressBarView';
import ResultView from './subViews/resultView';
import TooltipView from './subViews/tooltipView';
import InputView from './subViews/inputView';
import events from './mixins/eventsMixin';

class View {
  private _eventHandlers: Object = {};
  private _presenter: Presenter;

  public exec: Function;
  public on: Function;
  public off: Function;

  //скопированные с модели методы
  public getValueFromPercentage: Function;
  public isSliderReversedOrVertical: Function;
  public getValueFromCoords: Function;

  public $input: JQuery<HTMLElement>; //поле, в которое записывается значения ползунков
  public $inputParent: JQuery<HTMLElement>;

  public elements: slider.Elements = {
    handlers: [],
    connectors: [],
    tooltips: [],
    bounds: [],
    marks: [],
  };

  constructor($input?: JQuery<HTMLElement>) {
    if ($input) {
      this.$input = $input;
      this.$inputParent = $input.parent();
    }
  }

  get settings(): slider.Settings {
    return this._presenter.settings;
  }

  get values(): slider.Values {
    return this._presenter.values;
  }

  get sortedValues(): slider.Values {
    return this._presenter.sortedValues;
  }

  get templateValues(): string {
    return this._presenter.templateValues;
  }

  set presenter(newPresenter: Presenter) {
    this._presenter = newPresenter;
  }

  public debugStart(str: string): void {
    this.settings.debug && console.time(`[slider.View] ${str}`);
  }

  public debugEnd(str: string): void {
    this.settings.debug && console.timeEnd(`[slider.View] ${str}`);
  }

  public init(): View {
    this.initParent()
      .initWrapper()
      .initBaseWrapper()
      .initBase()
      .initMarksWrapper()
      .initResult()
      .initMarks()
      .initBounds()
      .initInput();

    this.settings.values.forEach((value, index) => {
      this.initHandler(index);
    });

    this.initProgressBar();

    this.addClasses(this.settings.additionalClasses);

    this.initEvents();

    if (this._presenter) this._presenter.exec('viewInit');

    return this;
  }

  public addClasses(obj: slider.AdditionalClasses): View {
    //добавляем дополнительные классы для элементов
    Object.keys(obj).forEach((key: keyof slider.AdditionalClasses) => {
      if (this.elements[key]) {
        if (Array.isArray(this.elements[key])) {
          (this.elements[key] as Array<BasicElementView>).forEach(
            ($element) => {
              $element.addClass(obj[key]);
            },
          );
        } else {
          (this.elements[key] as BasicElementView).addClass(obj[key]);
        }
      }
    });
    return this;
  }

  public initEvents() {
    this.on('handlerStart', this.handleHandlerStart);
    this.on('handlerEnd', this.handleHandlerEnd);
  }

  public handleHandlerStart(handler: HandlerView): void {
    if (this.settings.isEnabled) {
      this.debugStart('handlerStart took');
      handler.active = true;
      this.elements.handlers.forEach((item: HandlerView) => {
        if (item.focus) {
          item.focus = false;
        }
      });
      handler.focus = true;
      this.debugEnd('handlerStart took');
    }
  }

  public handleHandlerEnd(handler: HandlerView): void {
    this.debugStart('handlerEnd took');
    handler.active = false;
    this.debugEnd('handlerEnd took');
  }

  public reset() {
    if (this.elements.wrapper) {
      this.elements.wrapper.remove();
      this.elements = {
        handlers: [],
        connectors: [],
        tooltips: [],
        bounds: [],
        marks: [],
      };
    }
    this.init();

    if (this._presenter) this._presenter.exec('viewReset');
  }

  public initParent(): View {
    this.elements.$parent = new BasicElementView(this, this.$inputParent);
    return this;
  }

  public initWrapper(): View {
    this.elements.wrapper = new BasicElementView(
      this,
      $('<div class="js-slider"></div>'),
      this.elements.$parent.$element,
    );
    if (this.settings.isVertical) {
      this.elements.wrapper.addClass('js-slider_vertical');
    }
    if (!this.settings.isEnabled) {
      this.elements.wrapper.addClass('js-slider_disabled');
    }
    return this;
  }

  public initBaseWrapper(): View {
    this.elements.baseWrapper = new BasicElementView(
      this,
      $('<div class="js-slider__base-wrapper"></div>'),
      this.elements.wrapper.$element,
    );
    this.elements.baseWrapper.$element.on(
      'touchstart',
      (e) => {
        e.preventDefault();
      }, //улучшает отзывчивость слайдера на тачскринах
    );
    return this;
  }

  public initBase(): View {
    this.elements.base = new BaseView(this, this.elements.baseWrapper);
    return this;
  }

  public initMarksWrapper(): View {
    if (this.settings.showMarks) {
      this.elements.marksWrapper = new BasicElementView(
        this,
        $('<div class="js-slider__marks-wrapper"></div>'),
        this.elements.base.$element,
      );
    }
    return this;
  }

  public initMarks(): View {
    if (this.elements.marksWrapper) {
      for (let i = 0; i <= this.settings.marksCount; i++) {
        this.elements.marks.push(
          new MarkView(this, i, this.elements.marksWrapper),
        );
      }
    }
    return this;
  }

  public isBoundsOrMarksWithoutValuesShown() {
    const settings = this.settings;

    return (
      (settings.showBounds && !settings.showMarks) ||
      (settings.showMarks && settings.showBounds && !settings.showMarkValue)
    );
  }

  public initBounds(): View {
    const settings = this.settings;
    if (this.isBoundsOrMarksWithoutValuesShown()) {
      this.elements.bounds.push(
        new BoundView(this, settings.min, this.elements.baseWrapper.$element),
      );
      this.elements.bounds.push(
        new BoundView(this, settings.max, this.elements.baseWrapper.$element),
      );
      const $parent = this.elements.bounds[0].$parent;
      if (this.isSliderReversedOrVertical()) {
        this.elements.bounds[1].$element.prependTo($parent);
        this.elements.bounds[0].$element.appendTo($parent);
      } else {
        this.elements.bounds[0].$element.prependTo($parent);
        this.elements.bounds[1].$element.appendTo($parent);
      }
    }
    return this;
  }

  public initResult(): View {
    if (this.settings.showResult && this.settings.resultTemplate) {
      this.elements.result = new ResultView(this, this.elements.wrapper);
    }
    return this;
  }

  public initInput(): View {
    this.elements.input = new InputView(
      this,
      this.$input,
      this.elements.wrapper,
    );
    return this;
  }

  public initTooltip(index: number): View {
    if (this.settings.showTooltip) {
      this.elements.tooltips.push(
        new TooltipView(this, this.elements.handlers[index]),
      );
      this.elements.handlers[index].tooltip = this.elements.tooltips[index];
    }
    return this;
  }

  public initProgressBar(): View {
    if (this.elements.handlers.length === 1 && this.settings.showProgressBar) {
      this.elements.progressBar = new ProgressBarView(
        this,
        this.elements.handlers[0],
        this.elements.base,
      );
      this.elements.handlers[0].connector = this.elements.progressBar;
    }
    return this;
  }

  public initConnector(index: number): View {
    if (this.settings.showRange && index % 2 === 1) {
      const connectorIndex = Math.floor(index / 2);
      this.elements.connectors.push(
        new ConnectorView(
          this,
          connectorIndex,
          [this.elements.handlers[index - 1], this.elements.handlers[index]],
          this.elements.base,
        ),
      );
      this.elements.handlers[index - 1].connector = this.elements.connectors[
        connectorIndex
      ];
      this.elements.handlers[index].connector = this.elements.connectors[
        connectorIndex
      ];
    }

    return this;
  }

  public initHandler(index: number): View {
    this.elements.handlers.push(
      new HandlerView(this, index, this.elements.base),
    );
    this.initTooltip(index).initConnector(index);
    return this;
  }

  public getPercentage(value: number): number {
    //возвращает процентное соотношение value от min, max
    const settings = this.settings;
    let percentage: number;
    if (this.isSliderReversedOrVertical()) {
      percentage =
        ((settings.max - value) / (settings.max - settings.min)) * 100;
    } else {
      percentage =
        ((value - settings.min) / (settings.max - settings.min)) * 100;
    }
    if (percentage >= 0 && percentage <= 100) {
      return percentage;
    } else if (percentage > 100) {
      return 100;
    }
    return 0;
  }

  public getNearestHandler(percentage: number): HandlerView {
    let getNearestHandler: HandlerView = this.elements.handlers[0];
    if (this.elements.handlers.length > 1) {
      let lastDif: number = 100,
        dif: number;
      this.elements.handlers.forEach((item) => {
        item.focus = false;
        dif = Math.abs(item.percentage - percentage);
        if (lastDif > dif) {
          getNearestHandler = item;
          lastDif = dif;
        }
      });
    }
    return getNearestHandler;
  }

  public trigger(eventType: string, ...args: any) {
    this.exec(eventType, ...args);
    if (this._presenter) this._presenter.exec(eventType, ...args);
  }
}

Object.assign(View.prototype, events);

export default View;
