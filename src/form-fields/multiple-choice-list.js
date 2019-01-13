import React from 'react';
import { composeValidators } from '@data-driven-forms/react-form-renderer';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';

const MultipleChoiceList = ({ validate, FieldProvider, ...props }) => (
  <FieldProvider { ...props } validate={ composeValidators(props.validate || []) }>
    { ({
      label,
      isRequired,
      helperText,
      meta,
      options,
      ...rest
    }) => {
      const { error, touched } = meta;
      const showError = touched && error;
      const groupValues = rest.input.value;
      return (
        <Grid container validationState={ showError ? 'error' : null }>
          <Grid item md={ 2 } componentClass="label" className="control-label">
            { label }
          </Grid>
          <Grid item md={ 10 }>
            { options.map(option =>
              (<FieldProvider
                id={ `${rest.id}-${option.value}` }
                key={ option.value }
                { ...option }
                name={ props.name }
                type="checkbox"
                render={ ({ input, meta, ...rest }) => {
                  const indexValue = groupValues.indexOf(input.value);
                  return (
                    <Checkbox
                      aria-label={ option['aria-label'] || option.label }
                      { ...input }
                      { ...rest }
                      onChange={ () => (indexValue === -1
                        ? input.onChange([ ...groupValues, input.value ])
                        : input.onChange([ ...groupValues.slice(0, indexValue), ...groupValues.slice(indexValue + 1) ])) }
                    >
                      { rest.label }
                    </Checkbox>
                  );
                } }
              />)) }
          </Grid>
        </Grid>
      );
    } }
  </FieldProvider>
);

export default MultipleChoiceList;
