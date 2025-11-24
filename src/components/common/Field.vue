<template>
    <div class="field-container">
        <label class="field-label">{{ label }}:</label>
        <span class="field-value">{{ store.value }}</span>
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
.field-container {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 12px;
    padding: 20px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.field-label {
    display: block;
    font-weight: 600;
    color: #495057;
    margin-bottom: 8px;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.3s ease;
}

/* .field-container:hover .field-label {
    color: #007bff;
} */

.field-value {
    display: block;
    color: #333;
    font-size: 1.1rem;
    font-weight: 500;
    line-height: 1.4;
    word-break: break-word;
    transition: color 0.3s ease;
}

/* .field-container:hover .field-value {
    color: #0056b3;
}

.field-value:empty::before {
    content: '—';
    color: #6c757d;
    font-style: italic;
} */

/* Анимация появления */
.field-container {
    animation: fieldAppear 0.5s ease-out;
}

@keyframes fieldAppear {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Специальные стили для длинных значений */
.field-value[data-long="true"] {
    font-size: 1rem;
    line-height: 1.5;
}

/* Адаптивность */
@media (max-width: 768px) {
    .field-container {
        padding: 16px;
        border-radius: 10px;
    }
    
    .field-label {
        font-size: 0.9rem;
        margin-bottom: 6px;
    }
    
    .field-value {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .field-container {
        padding: 14px;
        border-radius: 8px;
    }
    
    .field-label {
        font-size: 0.85rem;
    }
    
    .field-value {
        font-size: 0.95rem;
    }
}

/* Дополнительные модификаторы через props */
.field-container.compact {
    padding: 12px 16px;
}

.field-container.compact .field-label {
    font-size: 0.85rem;
    margin-bottom: 4px;
}

.field-container.compact .field-value {
    font-size: 0.95rem;
}

.field-container.highlight {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    border-color: #2196f3;
}

.field-container.highlight .field-label {
    color: #1976d2;
}

.field-container.highlight .field-value {
    color: #0d47a1;
    font-weight: 600;
}

.field-container.warning {
    background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    border-color: #ff9800;
}

.field-container.warning .field-label {
    color: #f57c00;
}

.field-container.warning .field-value {
    color: #e65100;
    font-weight: 600;
}

.field-container.success {
    background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
    border-color: #4caf50;
}

.field-container.success .field-label {
    color: #388e3c;
}

.field-container.success .field-value {
    color: #1b5e20;
    font-weight: 600;
}
</style>