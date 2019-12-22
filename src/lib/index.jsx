import React, { Component } from "react"
import Calculator from './Calculator'
import PropTypes from 'prop-types'

class NumericInput extends Component {

    constructor(props) {
        super(props)
        this.state = {
            className: "dnone",
            inputValue: this.props.initialValue,
            displayValue: "0",
        };
        this.inputRef = React.createRef();
    }

    onFocus = (event) => {
        var parsedValue = this.props.format === 'integer'
            ? parseInt(event.target.value, 10)
            : parseFloat(event.target.value);
        this.setState({className: "dflex", displayValue: parsedValue.toString()});

    }

    onComplete = () => {
        var total = eval(this.state.displayValue).toFixed(4);
        const parsedValue = this.props.format === 'integer'
            ? parseInt(total, 10)
            : parseFloat(total);
        this.setState(
            {className:"dnone", inputValue: parsedValue, displayValue: parsedValue.toString()},
            this.proxyOnChangeOnRefWithValue(this.inputRef, parsedValue)
        );
    }

    onChangeDisplay = (val) => {
        var currentVal = this.state.displayValue
        var newValue = val.toString()


        /* delete */
        if(val==='<') {
            newValue = currentVal.slice(0,-1)
            /* avoid blank screen */
            if(newValue == '') {
                newValue = '0'
            }
            this.setState({displayValue: newValue});
            return
        }

        /* avoid double . insertion */
        var lastNumber = currentVal.split(/\-|\+|\/|\*/).pop()
        if(val==='.' && lastNumber.includes(".")){
            return
        }

        /* if it's not the first character or if next value is . */  
        if (currentVal != '0' || val == '.') {
            if(currentVal == '') {
                newValue = `0${val}`
            } else {
                newValue = `${currentVal}${val}`;    
            }
        }

        var lastCharacter = currentVal.split('').pop()
        if(['+', '-', '*', '/'].includes(val)) {
            /* avoid consecutive operation insertion */
            if(['+', '-', '*', '/'].includes(lastCharacter)) {
                newValue = `${currentVal.slice(0,-1)}${val}`
            }
            /* avoid .+ situations */
            if(lastCharacter == '.') {
                newValue = `${currentVal}0${val}`
            }
        } 

        this.setState({displayValue:newValue});
    }

    handleChange = (event) => {
        const parsedValue = this.props.format === 'integer'
            ? parseInt(event.target.value, 10)
            : parseFloat(event.target.value);
        const value = isNaN(parsedValue) ? 0 : parsedValue;
        const stringValue = value.toString();
        this.setState(
            {inputValue: value, displayValue: stringValue},
            this.proxyOnChangeOnRefWithValue(this.inputRef, value)
        );
    }

    onBlur = () => {
        setTimeout(() => {
            var active = document.activeElement
            if(!active.classList.contains("calculator-wrapper") || active.id == this.props.id) {
                this.setState({className: "dnone"});
            }
        }, 1);

    }

    onClose = () => {
        this.setState({className:"dnone"})
    }

    proxyOnChangeOnRefWithValue = (ref, value) => {
        if (typeof this.props.onChange !== 'function') return;
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {value: ref.current, enumerable: true, writable: true});
        event.target.value = value.toString();
        this.props.onChange(event);
    }

    sanitizeRenderProps = (props) => {
        delete props.ref;
        delete props.type;
        delete props.onFocus;
        delete props.onChange;
        delete props.onBlur;
        delete props.initialValue;
        return props;
    }

    render() {
        const props = Object.assign({}, this.props);
        const { label: labelProps, calculatorBackground: backgroundColor, labelPosition: labelPosition, calculatorKeyColor: calculatorKeyColor,  ...inputProps } = this.sanitizeRenderProps(props);

        return (
            <div className="numeric-input-component">
                {   props.label 
                    && props.labelPosition == "top"
                    && <label className={props.labelClassName} htmlFor={props.id}>{props.label}</label>
                }
                <input
                    ref={this.inputRef}
                    id={props.id}
                    className={props.className}
                    type="number"
                    name={props.name}
                    onFocus={this.onFocus}
                    value={this.state.inputValue}
                    onChange={this.handleChange}
                    onBlur={this.onBlur}
                    {...inputProps}
                />
                {   props.label 
                    && props.labelPosition == "bottom" 
                    && <label className={props.labelClassName} htmlFor={props.id}>{props.label}</label>
                } 
                <div className={ "calculator-wrapper " + this.state.className } tabIndex="-1">
                    <Calculator
                        onComplete={this.onComplete}
                        displayValue={this.state.displayValue}
                        onChangeDisplay={this.onChangeDisplay}
                        close={this.onClose}
                        backgroundColor={props.calculatorBackground}
                        keyColor={props.calculatorKeyColor}
                    />
                </div>
            </div>
        );
    }
}

NumericInput.propTypes = {
    id: PropTypes.string.isRequired,
    initialValue: PropTypes.number,
    label: PropTypes.string,
    labelPosition: PropTypes.oneOf(["top", "bottom"]),
    labelClassName: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    calculatorBackground: PropTypes.string,
    calculatorKeyColor: PropTypes.string,
    format: PropTypes.oneOf(["integer", "float"])

};

NumericInput.defaultProps = {
    labelPosition: "top",
    calculatorBackground: "#666",
    calculatorKeyColor: "#ccc",
    format: "float",
    initialValue: 0
}

export default NumericInput;
