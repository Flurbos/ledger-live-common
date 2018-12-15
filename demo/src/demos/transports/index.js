// @flow
import React, { Component } from "react";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportWebBLE from "@ledgerhq/hw-transport-web-ble";
import styled from "styled-components";
import axios from "axios";
import { setNetwork } from "@ledgerhq/live-common/lib/network";
import genuineCheck from "@ledgerhq/live-common/lib/hw/genuineCheck";
import getDeviceInfo from "@ledgerhq/live-common/lib/hw/getDeviceInfo";

setNetwork(axios);

let queue = Promise.resolve();
const execInQueue = <T>(job: () => Promise<T>) => {
  const p = queue.then(job);
  queue = p;
  return queue;
};

const transports = {
  webusb: TransportWebUSB,
  ble: TransportWebBLE
};

const createTransport = transportId => transports[transportId].create();

// ~~~ UI ~~~

class SelectTransport extends Component<*> {
  onChange = e => {
    this.props.onChange(e.target.value);
  };
  render() {
    return (
      <label>
        Transport:{" "}
        <select onChange={this.onChange} value={this.props.value}>
          {Object.keys(transports).map(key => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>
    );
  }
}

class GenuineCheckButton extends Component<*, *> {
  state = {
    running: false,
    error: null,
    result: ""
  };

  onClick = () => {
    const { transportId } = this.props;
    if (this.state.running) return;
    this.setState({ running: true, error: null });
    execInQueue(async () => {
      try {
        const transport = await createTransport(transportId);
        const deviceInfo = await getDeviceInfo(transport, {
          forceProvider: 4
        });
        const result = await genuineCheck(transport, deviceInfo).toPromise();
        this.setState({ running: false, error: null, result });
      } catch (error) {
        this.setState({ running: false, error, result: "" });
      }
    });
  };

  render() {
    const { running, error, result } = this.state;
    return (
      <p>
        <button onClick={this.onClick} disabled={running}>
          Do the Genuine Check
        </button>
        <em style={{ color: "red" }}>{error && error.message}</em>
        <strong>{result}</strong>
      </p>
    );
  }
}

const Main = styled.div`
  padding: 40px;
`;

class Transports extends Component<*, *> {
  static demo = {
    title: "Transports",
    url: "/transports"
  };

  state = {
    transportId: "webusb"
  };

  onTransportId = (transportId: string) => {
    this.setState({ transportId });
  };

  render() {
    const { transportId } = this.state;
    return (
      <Main>
        <SelectTransport value={transportId} onChange={this.onTransportId} />
        <GenuineCheckButton transportId={transportId} />
      </Main>
    );
  }
}

export default Transports;
