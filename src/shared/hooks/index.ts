import { ref } from "vue";

export const useToggle = (initialValue = false) => {
  const value = ref(initialValue);
  const setToggle = (newValue: boolean) => {
    value.value = newValue;
  }


  const toggle = () => {
    value.value = !value.value;
  };


  return { value, toggle, setToggle };
}