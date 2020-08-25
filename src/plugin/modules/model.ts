import $ from 'jquery';

import Presenter from './presenter';
import { Settings, Values } from '../types/slider';
import BaseView from './subViews/baseView';

class Model {
  private _presenter: Presenter;
  private _settings: Settings = {
    //default settings
    min: 0,
    max: 100,
    values: [30, 70],
    marksCount: 10,
    isEnabled: true,
    step: 1,
    decimalPlaces: 0,
    isVertical: false,
    isReversed: false,
    isTooltipReversed: false,
    isMarkValueReversed: false,
    showMarks: false,
    showTooltip: false,
    showResult: true,
    showBounds: true,
    showMarkValue: true,
    showInput: false,
    showRange: false,
    showProgressBar: false,
    isBaseClickable: true,
    isMarkClickable: true,
    sortValues: false,
    sortOnlyPares: false,
    sortReversed: false,
    resultTemplate: 'default',
    handlersStateClasses: {},
    additionalClasses: {},
    handlersColors: [],
    connectorsColors: [],
  };
  private _values: Values;

  public baseStartCoords: number = 0;
  public baseEndCoords: number = 0;
  public devideTo: number = 1;

  constructor(options?: Settings) {
    this.settings = options;
  }

  get settings(): Settings {
    return this._settings;
  }

  get values(): Values {
    return this._values;
  }

  get sortedValues(): Values {
    if (this._settings.sortValues) {
      if (this._settings.sortOnlyPares && this._values.length % 2 === 0) {
        //если нужно сортировать попарно и количество значений четно
        const arr = this._values.slice(0);
        if (this._settings.sortReversed) {
          for (let i = 0; i < arr.length; i += 2) {
            if (arr[i] < arr[i + 1]) {
              let tmp = arr[i];
              arr[i] = arr[i + 1];
              arr[i + 1] = tmp;
            }
          }
        } else {
          for (let i = 0; i < arr.length; i += 2) {
            if (arr[i] > arr[i + 1]) {
              let tmp = arr[i];
              arr[i] = arr[i + 1];
              arr[i + 1] = tmp;
            }
          }
        }
        return arr;
      } else {
        if (this._settings.sortReversed) {
          return this._values
            .slice(0)
            .sort(function (a: number, b: number): number {
              return b - a;
            });
        }
        return this._values
          .slice(0)
          .sort(function (a: number, b: number): number {
            return a - b;
          });
      }
    }
    return this._values;
  }

  get templateValues(): string {
    const resultTemplate = this._settings.resultTemplate,
      sortedValues = this.sortedValues;
    let templateString = 'undefined';
    if (resultTemplate !== 'default') {
      templateString = resultTemplate.replace(/\$(\d+)/g, function (
        substr: string,
        index: string,
      ): string {
        const value = sortedValues[+index - 1];
        return typeof value === 'number' ? String(value) : substr;
      });
    } else {
      return sortedValues.toString();
    }
    return templateString;
  }

  set values(newValues: Values) {
    if (Array.isArray(newValues)) {
      if (this.isValueInBounds(newValues)) {
        this._values = newValues;
        this.trigger('valueUpdated');
        this.trigger('valueEnd');
      } else throw new RangeError('Value is out of range!');
    } else throw new TypeError('New value must be an Array!');
  }

  set settings(newSettings: Settings) {
    this._settings = $.extend(this._settings, newSettings);
    if (this.isValueInBounds(this._settings.values)) {
      this._values = this._settings.values;
    } else {
      throw new RangeError('Start value is invalid (out of range)!');
    }
    this.trigger('settingsEnd');
  }

  set presenter(newPresenter: Presenter) {
    this._presenter = newPresenter;
  }

  public getValueRelativeToBounds(value: number): number {
    const settings = this.settings;

    if (value >= settings.min && value <= settings.max) {
      //если значение не попадает в границы, то мы берем за значение эти границы
      return value;
    } else if (value > settings.max) {
      return settings.max;
    }
    return settings.min;
  }

  public getFormattedValue(value: number): number {
    const settings = this.settings;
    const decimalPlaces = 10 ** settings.decimalPlaces;

    let tmp = settings.step
      ? settings.min + Math.floor(value / settings.step + 0.5) * settings.step
      : settings.min + value; //форматируется значение в зависимости от step
    tmp = decimalPlaces ? Math.floor(tmp * decimalPlaces) / decimalPlaces : tmp; //округление числа до decimalPlaces

    return tmp;
  }

  public isSliderReversedOrVertical(): boolean {
    //метод копируется во view
    const settings = this.settings;
    return (
      (settings.isReversed && !settings.isVertical) ||
      (!settings.isReversed && settings.isVertical)
    );
  }

  public getValueFromPercentage(percentage: number): number {
    //метод копируется во view
    const settings = this.settings;

    let value = percentage / 100;
    value *= settings.max - settings.min;

    if (this.isSliderReversedOrVertical()) {
      if (settings.max >= 0 && settings.min >= 0) {
        value = settings.max - value;
      } else if (settings.max < 0 && settings.min < 0) {
        value = settings.max - settings.min - value;
      } else {
        value =
          settings.max * ((settings.max - settings.min) / settings.max) - value;
      }
    }

    value = this.getFormattedValue(value);

    return this.getValueRelativeToBounds(value);
  }

  public getValueFromCoords(coords: number, base?: BaseView): number {
    //возвращает значение ползунка в зависимости от min, max, ширины базы, положения мыши, положения базы и настроек слайдера
    const settings = this.settings;
    let baseView: BaseView;
    if (base) {
      baseView = base;
    } else {
      baseView = this._presenter.base;
    }

    let value: number, devider: number, startCoords: number;
    if (settings.isVertical) {
      devider = baseView.$element.height();
      startCoords = baseView.$element[0].getBoundingClientRect().top;
    } else {
      devider = baseView.$element.width();
      startCoords = baseView.$element[0].getBoundingClientRect().left;
    }

    value = (coords - startCoords) / devider;
    value *= settings.max - settings.min;

    if (this.isSliderReversedOrVertical()) {
      if (settings.max >= 0 && settings.min >= 0) {
        value = settings.max - value;
      } else if (settings.max < 0 && settings.min < 0) {
        value = settings.max - settings.min - value;
      } else {
        value =
          settings.max * ((settings.max - settings.min) / settings.max) - value;
      }
    }

    value = this.getFormattedValue(value);

    return this.getValueRelativeToBounds(value);
  }

  public isValueInBounds(value: number | Values): boolean {
    //проверка значений на попадание в диапазон
    if (Array.isArray(value)) {
      let result = true;
      value.forEach((item) => {
        if (!this.isValueInBounds(item)) result = false;
      });
      return result;
    } else {
      return value >= this.settings.min && value <= this.settings.max;
    }
  }

  public trigger(eventType: string, ...args: any) {
    if (this._presenter) this._presenter.exec(eventType, ...args);
  }
}

export default Model;
