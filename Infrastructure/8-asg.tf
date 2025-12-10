resource "aws_autoscaling_group" "web" {
  name                      = "${var.project_name}-asg"
  min_size                  = 2
  max_size                  = 5
  desired_capacity          = 2
  vpc_zone_identifier       = module.vpc.private_subnets
  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }
  target_group_arns         = [aws_lb_target_group.web.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300
  
  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 90
      instance_warmup        = 300
      checkpoint_percentages = [50, 100]
      checkpoint_delay       = 300
    }
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-web"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = "production"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "scale_out" {
  name                   = "${var.project_name}-scale-out"
  autoscaling_group_name = aws_autoscaling_group.web.name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = 1
  cooldown               = 300
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.project_name}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 60
  alarm_description   = "Scale out if CPU > 60%"
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.web.name
  }
  alarm_actions       = [aws_autoscaling_policy.scale_out.arn]
}

output "asg_name" {
  value       = aws_autoscaling_group.web.name
  description = "Auto Scaling Group name for deployments"
}
