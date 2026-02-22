# Live Stats for Presentations — плагин Figma

Плагин подключается к WebSocket-серверу и в реальном времени обновляет текстовые слои на слайдах Figma по данным голосования (статистика опросов).

## Установка в Figma

1. **Resources** → **Plugins** → **Development** → **Import plugin from manifest…**
2. Выберите файл `manifest.json` из этой папки.
3. Плагин появится в **Plugins** → **Development** → **Live Stats for Presentations**.

## Запуск

1. Запустите WebSocket-сервер (например, на порту 3001).
2. В Figma: **Plugins** → **Development** → **Live Stats for Presentations**.
3. Введите URL (например `ws://localhost:3001`) и нажмите **Подключиться**.
4. Убедитесь, что в файле есть текстовые слои с именами по соглашению ниже.

## Соглашение имён слоёв

Имя текстового слоя должно **начинаться с `stats:`** (латиницей):

| Имя слоя         | Значение                          |
|------------------|-----------------------------------|
| `stats:total`    | Общее количество ответов          |
| `stats:question` | Текст вопроса                     |
| `stats:<optionId>` | Вариант по id (напр. `stats:yes`) |
| `stats:0`, `stats:1` | Вариант по индексу (первый, второй…) |

Пример: слой `stats:yes` будет заменён на строку вида «Да: 42 (58%)».

## Формат сообщений WebSocket

Сервер должен отправлять JSON:

```json
{
  "type": "stats",
  "payload": {
    "pollId": "poll-1",
    "question": "Вам понравилось выступление?",
    "optionIds": ["yes", "no", "maybe"],
    "optionLabels": { "yes": "Да", "no": "Нет", "maybe": "Не знаю" },
    "counts": { "yes": 42, "no": 10, "maybe": 5 },
    "total": 57
  }
}
```

Плагин использует только `payload`: `question`, `optionIds`, `optionLabels`, `counts`, `total`.

## Сборка

Сборка не требуется: плагин состоит из `manifest.json`, `code.js` и `ui.html`.

## Доступ к сети

В `manifest.json` указан доступ к сети (в т.ч. localhost) для подключения к WebSocket; описание назначения — в `networkAccess.reasoning`.
