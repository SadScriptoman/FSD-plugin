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
import $ from 'jquery';

class View {
  private _eventHandlers: Object = {};
  private _presenter: Presenter;

  public exec: Function;
  public on: Function;
  public off: Function;
  public valueFromPercentage: Function;

  public input: JQuery<HTMLElement>; //поле, в которое записывается значения ползунков
  public inputParent: JQuery<HTMLElement>;
  public elements: slider.Elements = {
    handlers: [],
    connectors: [],
    tooltips: [],
    bounds: [],
    marks: []
  };

  constructor(input?: JQuery<HTMLElement>) {
    if (input) {
      this.input = input;
      this.inputParent = input.parent();
    }
  }

  get settings(): slider.Settings {
    return this._presenter.settings;
  }

  set presenter(newPresenter: Presenter) {
    this._presenter = newPresenter;
  }

  public addClasses(obj: slider.AdditionalClasses): View {
    //добавляем дополнительные классы для элементов
    Object.keys(obj).forEach((key: keyof slider.AdditionalClasses) => {
      if (this.elements[key]) {
        if (Array.isArray(this.elements[key])) {
          (this.elements[key] as Array<BasicElementView>).forEach(element => {
            element.addClass(obj[key]);
          });
        } else {
          (this.elements[key] as BasicElementView).addClass(obj[key]);
        }
      }
    });
    return this;
  }

  public initParent(): View {
    this.elements.parent = new BasicElementView(this, this.inputParent);
    return this;
  }

  public initWrapper(): View {
    this.elements.wrapper = new BasicElementView(
      this,
      $('<div class="js-slider"></div>'),
      this.elements.parent.element
    );
    if (this.settings.vertical) {
      this.elements.wrapper.element.addClass('js-slider_vertical');
    }
    return this;
  }

  public initInput(): View {
    this.elements.input = new InputView(
      this,
      this.input,
      this._presenter.sortedValues,
      this.elements.wrapper
    );
    return this;
  }

  public initBaseWrapper(): View {
    this.elements.baseWrapper = new BasicElementView(
      this,
      $('<div class="js-slider__base-wrapper"></div>'),
      this.elements.wrapper.element
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
        this.elements.base.element
      );
    }
    return this;
  }

  public initMarks(): View {
    if (this.elements.marksWrapper) {
      for (let i = 0; i <= this.settings.marksCount; i++) {
        this.elements.marks.push(new MarkView(this, i, this.elements.marksWrapper));
      }
    }
    return this;
  }

  public initBounds(): View {
    const settings = this.settings;
    if (settings.showBounds && !settings.showMarks) {
      this.elements.bounds.push(
        new BoundView(this, settings.min, this.elements.baseWrapper.element)
      );
      this.elements.bounds.push(
        new BoundView(this, settings.max, this.elements.baseWrapper.element)
      );
      const parent = this.elements.bounds[0].parent;
      if ((!settings.reverse && settings.vertical) || (settings.reverse && !settings.vertical)) {
        this.elements.bounds[1].element.prependTo(parent);
        this.elements.bounds[0].element.appendTo(parent);
      } else {
        this.elements.bounds[0].element.prependTo(parent);
        this.elements.bounds[1].element.appendTo(parent);
      }
    }
    return this;
  }

  public initResult(): View {
    if (this.settings.showResult) {
      this.elements.result = new ResultView(
        this,
        this._presenter.formattedValues,
        this.elements.wrapper.element
      );
    }
    return this;
  }

  public initTooltip(index: number): View {
    if (this.settings.showTooltip) {
      this.elements.tooltips.push(new TooltipView(this, this.elements.handlers[index]));
      this.elements.handlers[index].tooltip = this.elements.tooltips[index];
    }
    return this;
  }

  public initProgressBar(): View {
    if (this.elements.handlers.length === 1 && this.settings.progressBar) {
      this.elements.progressBar = new ProgressBarView(
        this,
        this.elements.handlers[0],
        this.elements.base
      );
      this.elements.handlers[0].connector = this.elements.progressBar;
    }
    return this;
  }

  public initConnector(index: number): View {
    if (this.settings.range && index % 2 === 1) {
      const connectorIndex = Math.floor(index / 2);
      this.elements.connectors.push(
        new ConnectorView(
          this,
          connectorIndex,
          [this.elements.handlers[index - 1], this.elements.handlers[index]],
          this.elements.base
        )
      );
      this.elements.handlers[index - 1].connector = this.elements.connectors[connectorIndex];
      this.elements.handlers[index].connector = this.elements.connectors[connectorIndex];
    }

    return this;
  }

  public initHandler(value: number, index: number): View {
    this.elements.handlers.push(
      new HandlerView(this, index, this.getPercentage(value), value, this.elements.base)
    );
    this.initTooltip(index).initConnector(index);
    return this;
  }

  public init(): View {
    this.initParent()
      .initWrapper()
      .initInput()
      .initBaseWrapper()
      .initBase()
      .initMarksWrapper()
      .initResult()
      .initMarks()
      .initBounds();

    this.settings.startValues.forEach((value, index) => {
      this.initHandler(value, index);
    });

    this.initProgressBar();

    this.addClasses(this.settings.additionalClasses);

    this.on('handlerStart', function(handler: HandlerView) {
      handler.active = true;
      this.elements.handlers.forEach((item: HandlerView) => {
        if (item.focus) {
          item.focus = false;
        }
      });
      handler.focus = true;
    });

    this.on('handlerEnd', function(handler: HandlerView) {
      handler.active = false;
    });

    if (this._presenter) this._presenter.exec('viewInit');

    return this;
  }

  public reset() {
    if (this.elements.wrapper) {
      this.elements.wrapper.remove();
      this.elements = {
        handlers: [],
        connectors: [],
        tooltips: [],
        bounds: [],
        marks: []
      };
    }
    this.init();

    if (this._presenter) this._presenter.exec('viewReset');
  }

  public getPercentage(value: number): number {
    //возвращает процентное соотношение value от min, max
    const settings = this.settings;
    let percentage: number;
    if ((!settings.reverse && settings.vertical) || (settings.reverse && !settings.vertical)) {
      percentage = ((settings.max - value) / (settings.max - settings.min)) * 100;
    } else {
      percentage = ((value - settings.min) / (settings.max - settings.min)) * 100;
    }
    if (percentage >= 0 && percentage <= 100) {
      return percentage;
    } else if (percentage > 100) {
      return 100;
    }
    return 0;
  }

  public nearestHandler(percentage: number): HandlerView {
    let nearestHandler: HandlerView = this.elements.handlers[0];
    if (this.elements.handlers.length > 1) {
      let lastDif: number = 100,
        dif: number;
      this.elements.handlers.forEach(item => {
        item.focus = false;
        dif = Math.abs(item.percentage - percentage);
        if (lastDif > dif) {
          nearestHandler = item;
          lastDif = dif;
        }
      });
    }
    return nearestHandler;
  }

  public trigger(eventType: string, ...args: any) {
    this.exec(eventType, ...args);
    if (this._presenter) this._presenter.exec(eventType, ...args);
  }
}

Object.assign(View.prototype, events);

export default View;
