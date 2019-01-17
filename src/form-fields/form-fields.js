import React from 'react';
import PropTypes from 'prop-types';
import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { validationError } from './helpers';
import MultipleChoiceList from './multiple-choice-list';
import Grid from '@material-ui/core/Grid';
import MuiTextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import MuiRadio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import MuiSelect from './select-field';

import { MuiPickersUtilsProvider, TimePicker, DatePicker } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';

import './form-fields.scss';
const selectValue = option => option.sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' })).map(item => item.value);

const selectComponent = ({
  componentType,
  input,
  options,
  isReadOnly,
  isDisabled,
  invalid,
  placeholder,
  isRequired,
  label,
  isSearchable,
  FieldProvider,
  helperText,
  formOptions,
  bsSize,
  onText,
  offText,
  error,
  locale,
  ...rest
}) => ({
  [componentTypes.TEXT_FIELD]: () => (
    <MuiTextField
      { ...input }
      fullWidth
      error={ !!invalid }
      helperText={ helperText }
      disabled={ isDisabled }
      label={ label }
      placeholder={ placeholder }
      required={ isRequired }
      inputProps={{
        readOnly: isReadOnly,
      }}
      { ...rest }
    />
  ),
  [componentTypes.TEXTAREA_FIELD]: () => (
    <MuiTextField
      { ...input }
      error={ invalid }
      required={ isRequired }
      helperText={ helperText }
      disabled={ isDisabled }
      label={ label }
      placeholder={ placeholder }
      fullWidth
      multiline
      inputProps={{
        readOnly: isReadOnly,
      }}
      { ...rest }
    />
  ),
  [componentTypes.CHECKBOX]: () => (
    <FormControlLabel
      control={ <Checkbox { ...input } disabled={ isDisabled } value={ input.name } /> }
      label={ label }
    />
  ),
  [componentTypes.RADIO]: () => (
    <div  className="mui-ddform-radio-group">
      <FormControl component="fieldset">
        <FormLabel component="legend">{ label }</FormLabel>
        { options.map(option => (
          <FieldProvider
            key={ `${input.name}-${option.value}` }
            name={ input.name }
            value={ option.value }
            type="radio"
            render={ ({ input }) => (
              <FormControlLabel
                value="female"
                control={ <MuiRadio
                  { ...input }
                  disabled={ isDisabled }
                  onChange={ () => input.onChange(option.value) }/> }
                label={ option.label }
              />
            ) }
          />
        )) }
      </FormControl>
    </div>
  ),
  [componentTypes.SELECT_COMPONENT]: () => (
    <MuiSelect
      fullWidth
      { ...input }
      options={options.filter(option => option.hasOwnProperty('value') && option.value !== null)} // eslint-disable-line
      placeholder={ placeholder || 'Please choose' }
      value={ options.filter(({ value }) => rest.multi ? input.value.includes(value) : value === input.value) }
      isMulti={ rest.multi }
      isSearchable={ !!isSearchable }
      isClearable={ false }
      hideSelectedOptions={ false }
      closeMenuOnSelect={ !rest.multi }
      noOptionsMessage={ () => 'No option found' }
      invalid={ invalid }
      isDisabled={ isDisabled }
      textFieldProps={{
        label,
        color: invalid ? 'red' : 'blue',
        InputLabelProps: {
          shrink: true,
        },
      }}
      onChange={ option =>
        input.onChange(rest.multi ? selectValue(option) : option ? option.value : undefined) } // eslint-disable-line no-nested-ternary
      { ...rest }
    />),
  [componentTypes.SWITCH]: () => (
    <FormGroup row>
      <FormControlLabel
        control={ <Switch
          { ...rest }
          { ...input }
          readOnly={ isReadOnly }
          disabled={ isDisabled || isReadOnly }
          checked={ input.value }
          onChange={ ({ target: { checked }}) => input.onChange(checked) }
        /> }
        label={ label }
      />
    </FormGroup>),
  [componentTypes.DATE_PICKER]: () => (
    <MuiPickersUtilsProvider locale={ locale } utils={ MomentUtils }>
      <DatePicker
        fullWidth
        margin="normal"
        label={ label }
        { ...input }
      />
    </MuiPickersUtilsProvider>
  ),
  [componentTypes.TIME_PICKER]: () => (
    <MuiPickersUtilsProvider locale={ locale } utils={ MomentUtils }>
      <TimePicker
        fullWidth
        margin="normal"
        label={ label }
        { ...input }
      />
    </MuiPickersUtilsProvider>
  ),
})[componentType];

const FinalFormField = ({
  meta,
  validateOnMount,
  description,
  hideLabel,
  isVisible,
  label,
  ...rest
}) => {
  const invalid = validationError(meta, validateOnMount);
  return (
    <Grid item sm={ 12 }>
      { selectComponent({
        ...rest,
        invalid,
        label: invalid ? meta.error : label,
      })() }
    </Grid>
  );
};

FinalFormField.propTypes = {
  meta: PropTypes.object,
  validateOnMount: PropTypes.bool,
  label: PropTypes.string,
  helperText: PropTypes.string,
  description: PropTypes.string,
  hideLabel: PropTypes.bool,
  isVisible: PropTypes.bool,
};

const CheckboxGroupField = ({ options, ...rest }) =>
  (options ? <MultipleChoiceList options={ options } { ...rest } />
    : (
      <FinalFormField { ...rest }/>
    ));

const fieldMapper = type => ({
  [componentTypes.RADIO]: FinalFormField,
  [componentTypes.CHECKBOX]: props => <CheckboxGroupField { ...props } />,
  [componentTypes.SELECT_COMPONENT]: FinalFormField,
  [componentTypes.TEXTAREA_FIELD]: FinalFormField,
  [componentTypes.TEXT_FIELD]: FinalFormField,
  [componentTypes.SWITCH]: FinalFormField,
  [componentTypes.DATE_PICKER]: FinalFormField,
  [componentTypes.TIME_PICKER]: FinalFormField,
})[type];

const FieldInterface = ({
  dataType,
  condition,
  componentType,
  initialKey,
  ...props
}) => (
  <Grid xs={ 12 } item style={{ marginBottom: 16, padding: 0 }}>
    { fieldMapper(componentType)({
      ...props,
      componentType,
      id: props.id || props.name,
    }) }
  </Grid>
);

FieldInterface.propTypes = {
  meta: PropTypes.object,
  condition: PropTypes.shape({
    when: PropTypes.string.isRequired,
    is: PropTypes.oneOfType([ PropTypes.array, PropTypes.string ]).isRequired,
  }),
  validate: PropTypes.oneOfType([ PropTypes.array, PropTypes.func ]),
  componentType: PropTypes.oneOf([
    componentTypes.RADIO,
    componentTypes.CHECKBOX,
    componentTypes.SELECT_COMPONENT,
    componentTypes.TEXTAREA_FIELD,
    componentTypes.TEXT_FIELD,
    componentTypes.SUB_FORM,
    componentTypes.SWITCH,
    componentTypes.DATE_PICKER,
    componentTypes.TIME_PICKER,
  ]).isRequired,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  dataType: PropTypes.any,
  initialKey: PropTypes.any,
};

export const TextField = props => <FieldInterface { ...props } name={ props.input.name } componentType={ componentTypes.TEXT_FIELD } />;
export const TextareaField = props => <FieldInterface { ...props } name={ props.input.name } componentType={ componentTypes.TEXTAREA_FIELD } />;
export const SelectField = props => <FieldInterface { ...props } name={ props.input.name } componentType={ componentTypes.SELECT_COMPONENT } />;
export const Radio = props => <FieldInterface { ...props } name={ props.input.name } componentType={ componentTypes.RADIO } />;
export const CheckboxGroup = props => <FieldInterface { ...props } name={ props.input.name } componentType={ componentTypes.CHECKBOX } />;
export const SwitchField = ({ FieldProvider, ...props }) =>
  <FieldProvider { ...props } render={ props => <FieldInterface { ...props } name={ props.input.name } componentType={ componentTypes.SWITCH } /> }/>;
export const DatePickerField = props => <FieldInterface { ...props } name={ props.input.name } componentType={ componentTypes.DATE_PICKER } />;
export const TimePickerField = props => <FieldInterface { ...props } name={ props.input.name } componentType={ componentTypes.TIME_PICKER } />;
