import $ from 'jquery';

import View from '../view';
import BasicElementView from './basicElementView';

class BoundView extends BasicElementView {
  public static elementBase = $('<div class="js-slider__bound">undef.</div>');
  public value: number;

  constructor(
    view: View,
    value: number,
    parent: JQuery<HTMLElement> = $('body'),
    initCallback?: Function,
  ) {
    super(view, BoundView.elementBase.clone(), parent, initCallback);
    this.value = value;
    this.update();
  }

  public update(): void {
    this.element.text(this.value);
    this._view.trigger('boundUpdated', this);
  }
}

export default BoundView;
