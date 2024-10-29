import React, { useEffect, useMemo, useState } from "react";
import useValidator from "../../hooks/useValidator";
import validator from "../../hooks/useValidator";

export default function useFormGroup(props) {
  const [form, updateForm] = useState({});
  const { formvalidator } = props;
  const formValue = useMemo(() => {
    return Object.keys(form)
      .map((control) => {
        return {
          [control]: form[control]?.value ?? "",
        };
      })
      .reduce((prev, item) => {
        return {
          ...prev,
          ...item,
        };
      }, {});
  }, [form]);

  const formError = useMemo(() => {
    if (!formvalidator) return null;
    if (formvalidator instanceof Array && formvalidator?.length === 0)
      return null;
    for (let validator of formvalidator) {
      const error = validator(formValue);
      if (error && error instanceof Array && error?.length >= 1) {
        return error[1];
      }
    }
    return null;
  }, [formValue, formvalidator]);

  const valid = useMemo(() => {
    const isValid = Object.keys(form).every((control) => {
      const { errors } = form[control];
      if (errors) {
        return Object.values(errors).every((error) => error === false);
      }
      return true;
    });
    return isValid && !formError;
  }, [form, props, formValue, formError]);

  const updateControlValidation = (value = "", props) => {
    return {
      value: value,
      errors: validator({ value, ...props }),
    };
  };

  useEffect(() => {
    const { children } = props;
    const formState = {};
    React.Children.forEach(children, (child, index) => {
      const { name } = child.props;
      if (name) {
        formState[name] = updateControlValidation("", child.props);
      }
    });
    updateForm({ ...formState });
  }, []);

  const updateFormValidation = (props, value) => {
    form[props.name] = updateControlValidation(value, props);
    updateForm({ ...form });
  };

  return {
    ...props,
    form,
    updateForm: updateFormValidation,
    valid,
    formValue,
    formError,
  };
}