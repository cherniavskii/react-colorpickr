'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import themeable from 'react-themeable';
import { autokey } from './autokey';
import clamp from 'clamp';

const isMobile = typeof document != 'undefined' && 'ontouchstart' in document;

class XYControl extends React.Component {
  _isMounted = false;

  static propTypes = {
    children: PropTypes.node.isRequired,
    theme: PropTypes.object.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    xmax: PropTypes.number.isRequired,
    ymax: PropTypes.number.isRequired,
    isDark: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  change(pos) {
    if (!this._isMounted) return;
    const rect = this.getOwnBoundingRect();
    this.props.onChange({
      x: clamp(pos.left, 0, rect.width) / rect.width * this.props.xmax,
      y: clamp(pos.top, 0, rect.height) / rect.height * this.props.ymax
    });
  }

  getOwnBoundingRect() {
    return ReactDOM.findDOMNode(this).getBoundingClientRect();
  }

  _dragStart = e => {
    e.preventDefault();
    if (!this._isMounted) return;
    const rect = this.getOwnBoundingRect();
    const x = isMobile ? e.changedTouches[0].clientX : e.clientX;
    const y = isMobile ? e.changedTouches[0].clientY : e.clientY;

    const offset = {
      left: x - rect.left,
      top: y - rect.top
    };

    this.change(offset);

    // Handle interaction
    this.setState({
      start: { x: offset.left, y: offset.top },
      offset: { x, y }
    });

    window.addEventListener(isMobile ? 'touchmove' : 'mousemove', this._drag);
    window.addEventListener(isMobile ? 'touchend' : 'mouseup', this._dragEnd);
  };

  _drag = e => {
    e.preventDefault();
    const { start, offset } = this.state;
    const top =
      (isMobile ? e.changedTouches[0].clientY : e.clientY) +
      start.y - offset.y;
    const left =
      (isMobile ? e.changedTouches[0].clientX : e.clientX) +
      start.x - offset.x;

    this.change({ top, left });
  };

  _dragEnd = () => {
    window.removeEventListener(isMobile ? 'touchmove' : 'mousemove', this._drag);
    window.removeEventListener(isMobile ? 'touchend' : 'mouseup', this._dragEnd);
  };

  render() {
    const theme = autokey(themeable(this.props.theme));
    const {
      children,
      x,
      y,
      xmax,
      ymax,
      isDark
    } = this.props;

    const top = Math.round(clamp(y / ymax * 100, 0, 100));
    const left = Math.round(clamp(x / xmax * 100, 0, 100));

    return (
      <div
        {...theme('xyControlContainer')}
        onTouchStart={this._dragStart}
        onMouseDown={this._dragStart}
      >
        <div
          {...theme('xyControl', `${isDark ? 'xyControlDark' : ''}`)}
          style={{
            top: `${top}%`,
            left: `${left}%`
          }}
        />
        {children}
      </div>
    );
  }
}

export default XYControl;
