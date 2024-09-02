import { z } from 'zod'

export const INotificationValidator = z.object({
    id: z.string(),
    line_id: z.string(),
    stop_id: z.string(),
    distance: z.number(),
    distance_unit: z.enum(['kilometers', 'meters']),
    start_time: z.number().gte(0).lt(86400),
    end_time: z.number().gt(0).lte(86400),
    week_days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
}).superRefine(({start_time, end_time}, ctx) => {
    if (start_time > end_time) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Start time must be less than end time',
            path: ['start_time', 'end_time'],
        })
    }
})

export type INotification = z.infer<typeof INotificationValidator>