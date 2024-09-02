import { Static, Type } from '@sinclair/typebox'

export const INotificationValidator = Type.Object({
    line_id: Type.String(),
    stop_id: Type.String(),
    distance: Type.Number(),
    distance_unit: Type.Union([Type.Literal('km'), Type.Literal('m'), Type.Literal('min')]),
    start_time: Type.Number(),
    end_time: Type.Number(),
    week_days: Type.Array(Type.String()),
})

export type INotification = Static<typeof INotificationValidator>