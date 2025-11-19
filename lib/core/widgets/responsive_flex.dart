import 'package:flutter/material.dart';

class ResponsiveFlex extends StatelessWidget {
  const ResponsiveFlex({
    super.key,
    required this.children,
    this.breakpoint = 600,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.crossAxisAlignment = CrossAxisAlignment.center,
    this.mainAxisSize = MainAxisSize.max,
    this.verticalDirection = VerticalDirection.down,
    this.textDirection,
    this.textBaseline,
    this.spacing = 0,
  });

  final List<Widget> children;
  final double breakpoint;
  final MainAxisAlignment mainAxisAlignment;
  final CrossAxisAlignment crossAxisAlignment;
  final MainAxisSize mainAxisSize;
  final VerticalDirection verticalDirection;
  final TextDirection? textDirection;
  final TextBaseline? textBaseline;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isSmallScreen = constraints.maxWidth < breakpoint;
        final direction = isSmallScreen ? Axis.vertical : Axis.horizontal;

        // If spacing is provided, interleave SizedBoxes
        List<Widget> flexChildren = children;
        if (spacing > 0) {
          flexChildren = [];
          for (var i = 0; i < children.length; i++) {
            flexChildren.add(children[i]);
            if (i != children.length - 1) {
              flexChildren.add(
                SizedBox(
                  width: direction == Axis.horizontal ? spacing : 0,
                  height: direction == Axis.vertical ? spacing : 0,
                ),
              );
            }
          }
        }

        return Flex(
          direction: direction,
          mainAxisAlignment: mainAxisAlignment,
          crossAxisAlignment: crossAxisAlignment,
          mainAxisSize: mainAxisSize,
          verticalDirection: verticalDirection,
          textDirection: textDirection,
          textBaseline: textBaseline,
          children: flexChildren,
        );
      },
    );
  }
}
