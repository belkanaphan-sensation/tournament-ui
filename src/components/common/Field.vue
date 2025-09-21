<template>
    <div class="container">
        <label class="label"> {{ label }}: </label>
        <span class="value"> {{ store.value }}</span>
    </div>
</template>

<script>
    import { createFieldStore } from './FieldStore'

    let counter = 0

    export default {
        name: 'Field',
        props: {
            label: {
                type: String,
                default: ''
            },
            value: {
                type: [String, Number, Date],
                default: ''
            }
        },

        setup(props) {
            const componentId = `field-${counter++}`
            const store = createFieldStore(componentId)
            
            store.setValue(props.value);

            return {
                store
            }
        }
    }

</script>

<style scoped>
    .label {
        font-weight: bold;
        font-size: 12px;
    }

    .value {
        font-size: 12px;
    }

    .container {
        padding-bottom: 3px;
        padding-top: 3px;
    }

</style>