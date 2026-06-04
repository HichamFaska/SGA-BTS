import { createContext, useContext, forwardRef, useId } from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const FormFieldContext = createContext({})

const FormField = ({ ...props }) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    )
}

const FormItemContext = createContext({})

const FormItem = forwardRef(({ className, ...props }, ref) => {
    const id = useId()

    return (
        <FormItemContext.Provider value={{ id }}>
            <div ref={ref} data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
        </FormItemContext.Provider>
    )
})
FormItem.displayName = "FormItem"

const FormLabel = forwardRef(({ className, ...props }, ref) => {
    const { id } = useContext(FormItemContext)

    return (
        <Label ref={ref} data-slot="form-label" htmlFor={id} className={className} {...props} />
    )
})
FormLabel.displayName = "FormLabel"

const FormControl = forwardRef(({ ...props }, ref) => {
    const { id } = useContext(FormItemContext)
    const { getFieldState, formState } = useFormContext()
    const { name } = useContext(FormFieldContext)
    const { error } = getFieldState(name, formState)

    return (
        <Slot
            ref={ref}
            id={id}
            data-slot="form-control"
            aria-describedby={error ? `${id}-message` : undefined}
            aria-invalid={!!error}
            {...props}
        />
    )
})
FormControl.displayName = "FormControl"

const FormMessage = forwardRef(({ className, children, ...props }, ref) => {
    const { id } = useContext(FormItemContext)
    const { getFieldState, formState } = useFormContext()
    const { name } = useContext(FormFieldContext)
    const { error } = getFieldState(name, formState)
    const body = error ? String(error.message) : children

    if (!body) return null

    return (
        <p
            ref={ref}
            id={`${id}-message`}
            data-slot="form-message"
            className={cn("text-sm text-destructive", className)}
            {...props}
        >
            {body}
        </p>
    )
})
FormMessage.displayName = "FormMessage"

export { FormProvider, FormField, FormItem, FormLabel, FormControl, FormMessage }
