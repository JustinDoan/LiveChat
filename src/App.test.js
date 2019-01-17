import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from './App';
import Message from './message';

configure({ adapter: new Adapter() });

describe('Message', () => {
  it('Renders Correctly', () => {
    // Create Test Data for Message

    const TestMessage = {
      client: 'Test-ClientID',
      message: {
        message: 'Test-Message',
        userName: 'Test-Username',
      },
      messageID: 'Test-MessageID',
      name: 'Test-Name',
      timestamp: '12:00 pm',
    };

    const message = shallow(<Message messages={TestMessage} owner />);
    expect(message).toMatchSnapshot();
  });
});

describe('Main App', () => {
  it('Renders Correctly', () => {
    const app = shallow(<App />);
    expect(app).toMatchSnapshot();
  });
});
