/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import { FileInputLabel } from '../../src/index';

describe('FileInputLabel component', () => {
  it('is rendered', () => {
    const wrapper = mount(<FileInputLabel />);
    expect(wrapper).to.exist;
  });
});
